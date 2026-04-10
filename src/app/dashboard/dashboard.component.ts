import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectorRef, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DashboardService, TrendPoint, PurposePoint } from '../services/dashboard.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink, RouterOutlet, UserMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') trendCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('purposeCanvas') purposeCanvasRef!: ElementRef<HTMLCanvasElement>;

  visitorsToday = 0;
  activeVisitors = 0;
  totalRecords = 0;
  recentVisits: any[] = [];
  isLoading  = signal(false);
  lastUpdated = signal('');

  trendData: TrendPoint[] = [];
  purposeData: PurposePoint[] = [];

  private viewReady = false;
  private dataReady = false;
  private refreshInterval: any;

  private readonly COLORS = [
    '#800000', '#b03030', '#d45a5a', '#e8908a', '#f5bfbb',
    '#c0392b', '#922b21', '#6e2323', '#f08080', '#cd5c5c'
  ];

  constructor(private svc: DashboardService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    // Show cached stats immediately (no flicker when navigating back)
    const cached = this.svc.cachedStats;
    if (cached.totalRecords > 0 || cached.recentVisits.length > 0) {
      this.visitorsToday = cached.visitorsToday;
      this.activeVisitors = cached.activeVisitors;
      this.totalRecords = cached.totalRecords;
      this.recentVisits = cached.recentVisits;
      this.lastUpdated.set('Cached');
    }

    // Fetch live data right away
    await this.loadAll();
    this.refreshInterval = setInterval(() => this.loadAll(), 30000);
  }

  ngAfterViewInit() {
    this.viewReady = true;
    // If data already arrived before the view was ready, draw now
    if (this.dataReady) {
      this.scheduleChartDraw();
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  async loadAll() {
    // Only show spinner on first load when there is no data yet
    if (this.totalRecords === 0 && this.recentVisits.length === 0) {
      this.isLoading.set(true);
    }
    try {
      const [stats, trends, purposes] = await Promise.all([
        this.svc.getStats(),
        this.svc.getVisitorTrends(),
        this.svc.getVisitPurpose()
      ]);

      this.visitorsToday = stats.visitorsToday;
      this.activeVisitors = stats.activeVisitors;
      this.totalRecords = stats.totalRecords;
      this.recentVisits = stats.recentVisits;
      this.trendData = trends;
      this.purposeData = purposes;
      this.lastUpdated.set(new Date().toLocaleTimeString());
      this.dataReady = true;
      this.cdr.detectChanges();

      if (this.viewReady) {
        this.scheduleChartDraw();
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Use rAF so we draw after Angular finishes rendering the canvas elements */
  private scheduleChartDraw() {
    requestAnimationFrame(() => {
      this.drawTrendChart();
      this.drawPurposeChart();
    });
  }

  isActive(visit: any): boolean {
    return !visit.date_time_out;
  }

  // ─── BAR CHART: Visitor Trends ────────────────────────────────────────────
  private drawTrendChart() {
    const canvas = this.trendCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build a full 7-day map (fill missing days with 0)
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Use local date parts (not UTC) to match stored local-time datetimes
      const pad = (n: number) => String(n).padStart(2, '0');
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const found = this.trendData.find(t => t.visit_date?.slice(0, 10) === key);
      days.push({ label, count: found ? Number(found.count) : 0 });
    }

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 560;
    const H = canvas.clientHeight || 220;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const padL = 44, padR = 16, padT = 20, padB = 40;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const maxVal = Math.max(...days.map(d => d.count), 1);
    const barW = Math.floor(chartW / days.length * 0.55);
    const gap = (chartW - barW * days.length) / (days.length + 1);

    // Grid lines + Y-axis labels
    const steps = 4;
    ctx.strokeStyle = '#f0f0f0';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1;
    for (let s = 0; s <= steps; s++) {
      const val = Math.round((maxVal / steps) * s);
      const y = padT + chartH - (s / steps) * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
      ctx.fillText(String(val), padL - 6, y + 4);
    }

    // Bars
    days.forEach((d, i) => {
      const x = padL + gap + i * (barW + gap);
      const barH = (d.count / maxVal) * chartH;
      const y = padT + chartH - barH;

      const grad = ctx.createLinearGradient(x, y, x, padT + chartH);
      grad.addColorStop(0, '#800000');
      grad.addColorStop(1, '#f5a0a0');
      ctx.fillStyle = grad;

      const r = Math.min(5, barH / 2);
      ctx.beginPath();
      ctx.moveTo(x, padT + chartH);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.lineTo(x + barW - r, y);
      ctx.arcTo(x + barW, y, x + barW, y + r, r);
      ctx.lineTo(x + barW, padT + chartH);
      ctx.closePath();
      ctx.fill();

      // X label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, padT + chartH + 18);

      // Value on top of bar
      if (d.count > 0) {
        ctx.fillStyle = '#800000';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(String(d.count), x + barW / 2, y - 5);
      }
    });
  }

  // ─── DOUGHNUT CHART: Visit Purpose ────────────────────────────────────────
  private drawPurposeChart() {
    const canvas = this.purposeCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 260;
    const H = canvas.clientHeight || 190;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    if (this.purposeData.length === 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data yet', W / 2, H / 2);
      return;
    }

    const total = this.purposeData.reduce((s, p) => s + Number(p.count), 0);
    const cx = W / 2;
    const cy = H / 2 - 5;
    const outerR = Math.min(cx, cy) - 8;
    const innerR = outerR * 0.55;

    let angle = -Math.PI / 2;
    this.purposeData.forEach((p, i) => {
      const slice = (Number(p.count) / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = this.COLORS[i % this.COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      angle += slice;
    });

    // White inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(total), cx, cy + 6);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('total visits', cx, cy + 21);
  }

  // Legend entries for template
  get purposeLegend(): { label: string; color: string; count: number; pct: string }[] {
    const total = this.purposeData.reduce((s, p) => s + Number(p.count), 0) || 1;
    return this.purposeData.slice(0, 6).map((p, i) => ({
      label: p.purpose,
      color: this.COLORS[i % this.COLORS.length],
      count: Number(p.count),
      pct: ((Number(p.count) / total) * 100).toFixed(0) + '%'
    }));
  }
}