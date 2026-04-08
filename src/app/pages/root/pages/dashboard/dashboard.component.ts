import { Component, OnInit, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { localStorageLabels } from '../../../../enums';
import { BaseChartDirective } from 'ng2-charts';
import { DateTime } from 'luxon';

import { TestService } from '../test';
import { RootService } from '../../root.service';

import { ETestReference, IEtpTI, IListTI, ITest, IUser, TListTestItem, TWeek } from '../../../../interfaces';
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

  public dailyEtpsTarget = 0;
  public dailyPLTarget = 0;
  public etpsTarget = 0;
  public practiceListsTarget = 0;
  public completedTestsPercentage = 0;

  public elementsVisible: boolean = false;
  public listsVisible: boolean = false;
  public chartInfoVisible: boolean = false;
  public chartVisible: boolean = false;

  public barChartType: ChartType = 'bar';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: { legend: { display: true } }
  };

  public barChartOptions2: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4ee'
        }
      },
      x: {
        grid: {
          color: '#f3f4ee'
        }
      }
    },
    plugins: { legend: { display: true, labels: { color: '#f3f4ee' } } }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  private etps: TListTestItem[] = [];
  public todayEtps: TListTestItem[] = [];
  // private practiceLists: ITest[] = [];

  public etpsMonthNumber: number = 0;
  // public etpsTodayNumber: number = 0;
  public etpsNumber: number = 0;
  public listsMonthNumber: number = 0;
  public listsNumber: number = 0;
  public monthlyProgress: number = 0;


  get en(): boolean {
    return (localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en') === 'en';
  }

  get mothYear(): string {
    const getMoth = (m: number): string => {
      let month = '';
      switch (m) {
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
      return month;
    };
    const months = this.weeks[this.actualWeekIndex]?.months.map(m => getMoth(m)).join(' / ');
    // return `${months} - ${this.weeks[this.actualWeekIndex]?.year}`;
    return `${months} - ${this.weeks[this.actualWeekIndex]?.year}`;
  }

  constructor(private _rootSvc: RootService, private _testSvc: TestService) { }

  ngOnInit(): void {
    this.getTests();
  }

  // =========================
  // 🔥 CORE LOGIC
  // =========================

  // private ensureWeekExists(date: DateTime): number {
  //   let index = this.weeks.findIndex(w => w.weekNumber === date.weekNumber && w.year === date.year);

  //   if (index < 0) {
  //     const labels = this.getLabels(date);

  //     this.weeks.push({
  //       year: date.year,
  //       month: date.month,
  //       weekNumber: date.weekNumber,
  //       labels,
  //       datasets: [
  //         { data: [0, 0, 0, 0, 0, 0, 0], label: this.en ? 'Elements' : 'Elementos' },
  //         { data: [0, 0, 0, 0, 0, 0, 0], label: this.en ? 'Lists' : 'Listas' },
  //       ],
  //     });

  //     index = this.weeks.length - 1;
  //   }

  //   return index;
  // }

  // private getTodayEtps(): TListTestItem[] {
  //   return this.etps.filter(etp => { const { year, month, day } = DateTime.fromISO(etp.date as string); return `${day}/${month}/${year}` === `${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}` });
  // }

  private getEtpsNumber(options: { m: boolean, t: boolean }): number {
    const { m, t } = options;
    if (this.etps.length === 0) return 0;
    if (t) return Math.floor((this.todayEtps.length) * 100) / 100;

    const numbers = this.etps.filter(etp => m ? etp.number >= 1 && DateTime.fromISO(etp.date as string).month === DateTime.now().month : etp.number >= 1);
    const max = Math.max(...this.etps.filter(etp => m ? etp.number < 1 && DateTime.fromISO(etp.date as string).month === DateTime.now().month : etp.number < 1).map(etp => etp.number));
    // return this.correctEtps.map(item => item.number).reduce((a, b) => a + b, 0);
    return Math.floor((numbers.length + max) * 100) / 100;
  }

  private getListsNumber(m?: boolean): number {
    if (this.lists.length === 0) return 0;

    const numbers =
      this.lists.filter(
        list => m ?
          list.number >= 1 &&
          DateTime.fromISO(list.date as string).month === DateTime.now().month :
          list.number >= 1
      );
    const max =
      Math.max(
        ...this.lists.filter(
          list => m ?
            list.number < 1 &&
            DateTime.fromISO(list.date as string).month === DateTime.now().month :
            list.number < 1
        ).map(list => list.number));
    console.log({ lists: this.lists, date: DateTime.fromISO(this.lists[0].date as string), numbers, max });
    return Math.floor((numbers.length + max) * 100) / 100;
  }

  private getMonthlyProgress(): number {

    const Eprogress = (this.etpsMonthNumber * 100) / this.etpsTarget;
    // const Pprogress = (this.lists.filter(list => DateTime.fromISO(list.date as string).month === DateTime.now().month).length * 100) / this.practiceListsTarget;
    const Pprogress = (this.listsMonthNumber * 100) / this.practiceListsTarget;
    const result = ((Eprogress >= 100 ? 100 : Eprogress) / 2) + ((Pprogress >= 100 ? 100 : Pprogress) / 2);
    return Math.floor(result * 100) / 100;
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

  private generateWeeks(from: DateTime, to: DateTime): TWeek[] {
    const weeks: TWeek[] = [];

    let cursor = from.startOf('week'); // lunes
    const end = to.endOf('week');

    while (cursor <= end) {
      weeks.push({
        year: cursor.year,
        months: [cursor.startOf('week').month, cursor.endOf('week').month].filter((m, i, arr) => arr.indexOf(m) === i), // meses únicos
        weekNumber: cursor.weekNumber,
        labels: this.getLabels(cursor),
        datasets: [
          { data: [0, 0, 0, 0, 0, 0, 0], label: this.en ? 'Elements' : 'Elementos' },
          { data: [0, 0, 0, 0, 0, 0, 0], label: this.en ? 'Lists' : 'Listas' },
        ]
      });

      cursor = cursor.plus({ weeks: 1 });
    }

    return weeks;
  }

  private comproveIsToday(date: DateTime): boolean {
    const { day, month, year } = DateTime.now();
    return `${day}/${month}/${year}` === `${date.day}/${date.month}/${date.year}`
  }

  private processTests(tests: ITest[]): void {
    this.weeks = [];
    this.correctEtps = [];
    this.mistakenEtps = [];
    this.lists = [];
    this.completedTestsPercentage = 0;

    // ✅ ORDEN CLAVE
    tests.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const allDates: DateTime[] = [];

    tests.forEach(test => {
      const tDate = DateTime.fromISO(test.createdAt);
      allDates.push(tDate);
      if (this.comproveIsToday(tDate)) this.completedTestsPercentage += test.completedPercentage;

      test.correctOnes.forEach(co => {
        if (typeof co.date === 'string') {
          allDates.push(DateTime.fromISO(co.date));
        }
      });
    });

    if (!allDates.length) return;

    // 2. Generar semanas completas
    const minDate = allDates.reduce((min, d) => d < min ? d : min, allDates[0]);
    this.weeks = this.generateWeeks(minDate, DateTime.now());

    // 3. Crear mapa
    const weekMap = new Map<string, number>();
    this.weeks.forEach((w, i) => {
      weekMap.set(`${w.year}-${w.weekNumber}`, i);
    });

    tests.forEach(test => {
      const testDate = DateTime.fromISO(test.createdAt);

      // ===== ELEMENTS =====
      test.correctOnes.forEach(co => {
        // const coDate = DateTime.fromISO(typeof co.date === 'string' ? co.date : '');
        // const index = this.ensureWeekExists(coDate);

        // this.weeks[index].datasets[0].data[coDate.weekday - 1]++;
        const coDate = DateTime.fromISO(co.date as string);
        const index = weekMap.get(`${coDate.year}-${coDate.weekNumber}`);
        if (index !== undefined) {
          this.weeks[index].datasets[0].data[coDate.weekday - 1]++;
        }

        const cIndex = this.correctEtps.findIndex(e => e.id === co.id);
        if (cIndex < 0) {
          this.correctEtps.push({ ...co, number: co.number / 20 });
        } else if (this.correctEtps[cIndex].number < 1) {
          this.correctEtps[cIndex].number += co.number / 20;
        }
      });

      // ===== LISTS =====
      if (test.reference === ETestReference.practiceLists && test.completedPercentage === 100) {
        // const index = this.ensureWeekExists(testDate);

        test.practiceListReferences.forEach(ref => {
          // this.weeks[index].datasets[1].data[testDate.weekday - 1]++;
          const index = weekMap.get(`${testDate.year}-${testDate.weekNumber}`);
          if (index !== undefined) {
            this.weeks[index].datasets[1].data[testDate.weekday - 1]++;
          }

          const lIndex = this.lists.findIndex(l => l.reference.id === ref.id);
          if (lIndex < 0) {
            this.lists.push({ reference: ref, date: test.createdAt, number: 1 / 20 });
          } else {
            this.lists[lIndex].number += 1 / 20;
          }
        });
      }

      // this.ensureWeekExists(DateTime.now());

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

    this.etps = this.correctEtps.map(item => { return { date: item.date, number: item.number } });

    this.todayEtps = this.etps.filter(etp => this.comproveIsToday(DateTime.fromISO(etp.date as string)));
    if (this.correctEtps.length > 0) {
      this.etpsNumber = this.getEtpsNumber({ m: false, t: false });
      this.etpsMonthNumber = this.getEtpsNumber({ m: true, t: false });
      // this.etpsTodayNumber = this.getEtpsNumber({ m: false, t: true });
      this.listsNumber = this.getListsNumber();
      this.listsMonthNumber = this.getListsNumber(true);
    }
    this.monthlyProgress = this.getMonthlyProgress();
    console.log({ monthlyProgress: this.monthlyProgress });

    // ✅ ordenar semanas correctamente
    this.weeks.sort((a, b) =>
      a.year !== b.year
        ? a.year - b.year
        : a.weekNumber - b.weekNumber
    );

    this.completedTestsPercentage = Math.floor((this.completedTestsPercentage / tests.length) * 100) / 100;
    // 👉 mostrar última semana
    this.actualWeekIndex = this.weeks.length - 1;

    this.refreshChart();
  }

  public getDailyEtpsTarget(): number {
    // return Math.ceil(this.etpsTarget / DateTime.now().daysInMonth);
    return Math.floor((this.etpsTarget / DateTime.now().daysInMonth) * 100) / 100;
  }

  public getDailyPLTarget(): number {
    // return Math.ceil(this.practiceListsTarget / DateTime.now().daysInMonth);
    return Math.floor((this.practiceListsTarget / DateTime.now().daysInMonth) * 100) / 100;
  }

  // private refreshChart(): void {
  public refreshChart(): void {
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
      this.dailyEtpsTarget = this.getDailyEtpsTarget();
      this.dailyPLTarget = this.getDailyPLTarget();

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

  // public randomize(): void {
  //   this.barChartType = this.barChartType === 'bar' ? 'line' : 'bar';
  // }
}