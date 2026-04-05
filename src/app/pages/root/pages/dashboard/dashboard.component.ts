import { Component, OnInit, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { localStorageLabels } from '../../../../enums';
import { BaseChartDirective } from 'ng2-charts';
import { DateTime } from 'luxon';

import { TestService } from '../test';
import { RootService } from '../../root.service';

import { ETestReference, IEtpTI, IListTI, ITest, IUser, TWeek } from '../../../../interfaces';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, BaseChartDirective, NzPopoverModule, NzIconModule, NzPaginationModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public tests: ITest[] = [];
  public weeks: TWeek[] = [];
  public lists: IListTI[] = [];

  public correctEtps: IEtpTI[] = [];
  public mistakenEtps: IEtpTI[] = [];

  public actualWeekIndex = 0;

  public etpsTarget = 0;
  public practiceListsTarget = 0;
  public completedTestsPercentage = 0;

  public elementsVisible: boolean = false;
  public listsVisible: boolean = false;

  public barChartType: ChartType = 'bar';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: true } }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  get en(): boolean {
    return (localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en') === 'en';
  }

  get etps() {
    return this.correctEtps.map(item => item.number);
  }

  get etpsNumber(): number {
    if (this.correctEtps.length === 0) return 0;
    const numbers = this.etps.filter(num => num >= 1);
    const max = Math.max(...this.etps.filter(num => num < 1));
    // return this.correctEtps.map(item => item.number).reduce((a, b) => a + b, 0);
    return Math.floor((numbers.length + max) * 100) / 100;
  }

  get practiceLists(): ITest[] {
    return this.tests.filter(test => test.reference === ETestReference.practiceLists && test.completedPercentage === 100);
  }

  get monthlyProgress(): number {
    // const { length } = this.reports.etps.total;
    // return length > 0 ? (length * 100) / this.monthlyTarget : 0;

    const Eprogress = (this.etpsNumber * 100) / this.etpsTarget;
    const Pprogress = (this.practiceLists.length * 100) / this.practiceListsTarget;
    return ((Eprogress > 100 ? 100 : Eprogress) / 2) + ((Pprogress > 100 ? 100 : Pprogress) / 2);
  }

  get mothYear(): string {
    const today = DateTime.now();
    // const month = this.en ? today.toFormat('LLLL') : today.setLocale('es').toFormat('LLLL');
    let month = '';
    switch (this.weeks[this.actualWeekIndex]?.month) {
      case 1: month = this.en ? 'January' : 'Enero'; break;
      case 2: month = this.en ? 'February' : 'Febrero'; break;
      case 3: month = this.en ? 'March' : 'Marzo'; break;
      case 4: month = this.en ? 'April' : 'Abril'; break;
      case 5: month = this.en ? 'May' : 'Mayo'; break;
      case 6: month = this.en ? 'June' : 'Junio'; break;
      case 7: month = this.en ? 'July' : 'Julio'; break;
      case 8: month = this.en ? 'August' : 'Agosto'; break;
      case 9: month = this.en ? 'September' : 'Septiembre'; break;
      case 10: month = this.en ? 'October' : 'Octubre'; break;
      case 11: month = this.en ? 'November' : 'Noviembre'; break;
      case 12: month = this.en ? 'December' : 'Diciembre'; break;
    }
    return `${month} - ${this.weeks[this.actualWeekIndex]?.year}`;
  }

  constructor(private _rootSvc: RootService, private _testSvc: TestService) { }

  ngOnInit(): void {
    this.getTests();
  }

  // =========================
  // 🔥 CORE LOGIC
  // =========================

  private ensureWeekExists(date: DateTime): number {
    let index = this.weeks.findIndex(w => w.weekNumber === date.weekNumber && w.year === date.year);

    if (index < 0) {
      const labels = this.getLabels(date);

      this.weeks.push({
        year: date.year,
        month: date.month,
        weekNumber: date.weekNumber,
        labels,
        datasets: [
          { data: [0, 0, 0, 0, 0, 0, 0], label: this.en ? 'Elements' : 'Elementos' },
          { data: [0, 0, 0, 0, 0, 0, 0], label: this.en ? 'Lists' : 'Listas' },
        ],
      });

      index = this.weeks.length - 1;
    }

    return index;
  }

  private getLabels(date: DateTime): string[] {
    const weekday = date.weekday;

    const getDay = (d: number) => {
      const diff = weekday - d;
      return diff > 0
        ? date.minus({ days: diff }).day
        : date.plus({ days: Math.abs(diff) }).day;
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysEs = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return Array.from({ length: 7 }, (_, i) => {
      const name = this.en ? days[i] : daysEs[i];
      return `${name} - ${getDay(i + 1)}`;
    });
  }

  private processTests(tests: ITest[]): void {
    this.weeks = [];
    this.correctEtps = [];
    this.mistakenEtps = [];
    this.lists = [];

    // ✅ ORDEN CLAVE
    tests.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    tests.forEach(test => {
      const testDate = DateTime.fromISO(test.createdAt);

      // ===== ELEMENTS =====
      test.correctOnes.forEach(co => {
        const coDate = DateTime.fromISO(typeof co.date === 'string' ? co.date : '');
        const index = this.ensureWeekExists(coDate);

        this.weeks[index].datasets[0].data[coDate.weekday - 1]++;

        const cIndex = this.correctEtps.findIndex(e => e.id === co.id);
        if (cIndex < 0) {
          this.correctEtps.push({ ...co, number: co.number / 20 });
        } else if (this.correctEtps[cIndex].number < 1) {
          this.correctEtps[cIndex].number += co.number / 20;
        }
      });

      // ===== LISTS =====
      if (test.reference === ETestReference.practiceLists && test.completedPercentage === 100) {
        const index = this.ensureWeekExists(testDate);

        test.practiceListReferences.forEach(ref => {
          this.weeks[index].datasets[1].data[testDate.weekday - 1]++;

          const lIndex = this.lists.findIndex(l => l.reference.id === ref.id);
          if (lIndex < 0) {
            this.lists.push({ reference: ref, date: test.createdAt, number: 1 });
          } else {
            this.lists[lIndex].number++;
          }
        });
      }

      // ===== MISTAKES =====
      test.mistakes.forEach(m => {
        const mIndex = this.mistakenEtps.findIndex(e => e.id === m.id);
        if (mIndex < 0) {
          this.mistakenEtps.push(m);
        } else {
          this.mistakenEtps[mIndex].number += m.number;
        }
      });
    });

    // ✅ ordenar semanas correctamente
    this.weeks.sort((a, b) =>
      a.year !== b.year
        ? a.year - b.year
        : a.weekNumber - b.weekNumber
    );

    // 👉 mostrar última semana
    this.actualWeekIndex = this.weeks.length - 1;

    this.refreshChart();
  }

  private refreshChart(): void {
    if (!this.weeks.length) return;

    const week = this.weeks[this.actualWeekIndex];

    this.barChartData = {
      labels: [...week.labels],
      datasets: [
        {
          data: [...week.datasets[0].data],
          label: this.en ? 'Elements' : 'Elementos'
        },
        {
          data: [...week.datasets[1].data],
          label: this.en ? 'Lists' : 'Listas'
        }
      ]
    };

    this.chart?.update();
  }

  // =========================
  // 🔥 DATA
  // =========================

  public getTests(): void {
    this._rootSvc.user$.subscribe((user: IUser) => {
      this.etpsTarget = user.monthlyObjective?.etps ?? 0;
      this.practiceListsTarget = user.monthlyObjective?.lists ?? 0;

      this._testSvc.getFilteredTests({ author: user.id }).subscribe(tests => {
        this.tests = tests;
        this.processTests(tests);
      });
    });
  }

  // =========================
  // 🔥 UX (opcional)
  // =========================

  public nextWeek(): void {
    if (this.actualWeekIndex < this.weeks.length - 1) {
      this.actualWeekIndex++;
      this.refreshChart();
    }
  }

  public prevWeek(): void {
    if (this.actualWeekIndex > 0) {
      this.actualWeekIndex--;
      this.refreshChart();
    }
  }

  public randomize(): void {
    this.barChartType = this.barChartType === 'bar' ? 'line' : 'bar';
  }
}