import { Component, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { localStorageLabels } from '../../../../enums';

import { BubbleDataPoint, Chart, ChartConfiguration, ChartTypeRegistry, Point } from 'chart.js/auto';
import { DateTime } from 'luxon';

import { TestService } from '../test';
import { RootService } from '../../root.service';

import { ETestReference, ITest, IUser, TEtpTI } from '../../../../interfaces';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface ITT {
  total: string[];
  today: string[];
}

interface ITTN {
  total: number;
  today: number;
}

interface IReport {
  etps: ITT;
  practiceLists: ITTN;
}

interface IChartData {
  weekday: number,
  // day: number,
  val: string[]
}

interface IWeekWord {
  word: string;
  number: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, NzPopoverModule, NzIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  public chart!: Chart;

  public etpsTarget: number = 0;
  public practiceListsTarget: number = 0;

  public tests: ITest[] = [];
  public lists: TEtpTI[] = [];
  public completedTestsPercentage: number = 0;

  public correctEtps: TEtpTI[] = [];
  public mistakenEtps: TEtpTI[] = [];

  public elementsVisible: boolean = false;
  public listsVisible: boolean = false;

  public reports: IReport = {
    etps: {
      total: [],
      today: []
    },
    practiceLists: {
      total: 0,
      today: 0
    },
  }
  public chartData: IChartData[] = [
    {
      weekday: 1,
      val: []
    },
    {
      weekday: 2,
      val: []
    },
    {
      weekday: 3,
      val: []
    },
    {
      weekday: 4,
      val: []
    },
    {
      weekday: 5,
      val: []
    },
    {
      weekday: 6,
      val: []
    },
    {
      weekday: 7,
      val: []
    },
  ];

  public weekWords: IWeekWord[] = [
    {
      word: this.en ? 'Monday' : 'Lunes',
      number: 0
    },
    {
      word: this.en ? 'Tuesday' : 'Martes',
      number: 0
    },
    {
      word: this.en ? 'Wednesday' : 'Miércoles',
      number: 0
    },
    {
      word: this.en ? 'Thursday' : 'Jueves',
      number: 0
    },
    {
      word: this.en ? 'Friday' : 'Viernes',
      number: 0
    },
    {
      word: this.en ? 'Saturday' : 'Sábado',
      number: 0
    },
    {
      word: this.en ? 'Sunday' : 'Domingo',
      number: 0
    }
  ];


  // get monthlyTarget(): number {
  //   return this.etpsTarget + this.practiceListsTarget;
  // }

  get en(): boolean {
    const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en'
    return en === 'en';
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

  constructor(private _rootSvc: RootService, private _testSvc: TestService) { }

  ngOnInit() {
    this.createChart([null, null, null, null, null, null, null]);
    this.getTests();
  }

  public createChart(data: Array<number | null>): Chart<keyof ChartTypeRegistry, (number | [number, number] | Point | BubbleDataPoint | null)[], unknown> {
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'],
        datasets: [{
          label: 'Repasos exitosos',
          // data: [2, 3, 1, 5, 4],
          data,
          borderColor: '#1a1835',
          backgroundColor: '#413c85',
          tension: 0.3,
          // fill: true
        }]
      },
      options: {
        responsive: true,       // 👈 hace que el gráfico sea responsive
        maintainAspectRatio: false, // 👈 permite ajustar al tamaño del contenedor
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    };

    // this.chart = new Chart(this.lineChart.nativeElement, config);
    return this.chart = new Chart('chart', config);
  }

  public getTests(): void {
    const testsProcess = (tests: ITest[]) => {
      const format: string = 'yyyy-MM-dd';
      const todayD = DateTime.now();
      const todayDate = todayD.toFormat(format);
      tests
        .sort((a, b) => a.createdAt > b.createdAt ? 1 : -1)
        .forEach(test => {
          const testDate = DateTime.fromISO(test.createdAt);
          // console.log({ testDate });
          const { etps } = test;
          // const { year } = testDate;
          // if(!years.includes(year)) years.push(year)
          const tyear = todayD.year;
          const tmonth = todayD.month;
          const tweekNumber = todayD.weekNumber;
          const { year, month, weekday, weekNumber } = testDate;
          if (tyear === year && tmonth === month && tweekNumber === weekNumber) {
            const index = this.chartData.findIndex(item => item.weekday === weekday);
            const { val } = this.chartData[index];
            etps.forEach(etpItem => {
              if (!val.includes(etpItem.id ?? ''))
                val.push(etpItem.id ?? '')
            })
            this.chartData[index].val = val;
          }
          const condition = todayDate === testDate.toFormat(format);
          etps.forEach(etpItem => {
            const { total, today } = this.reports.etps;
            if (typeof etpItem !== 'string' && !total.includes(etpItem.id ?? '')) {
              total.push(etpItem.id ?? '');
              if (condition)
                today.push(etpItem.id ?? '');
            }
            this.reports.etps = { today, total };
          });
          if (test.reference === ETestReference.practiceLists) {
            this.reports.practiceLists.total++;
            if (condition) this.reports.practiceLists.today++;
          }
        });
      // const { weekday } = todayD;
      this.chart.destroy();
      this.createChart(this.chartData.map(item => item.val.length ?? null));
      // console.log({ chartData: this.chartData })
    }
    const tPss = (tests: ITest[]) => {
      this.correctEtps = [];
      this.mistakenEtps = [];
      this.completedTestsPercentage = 0;
      // const correctEtps: TEtpTI[] = [];
      // const mistakenEtps: TEtpTI[] = [];

      tests.forEach(test => {
        const { correctOnes, mistakes, completedPercentage, reference, createdAt } = test;
        const testDate = DateTime.fromISO(createdAt);
        console.log({ testDate, correctOnes, mistakes, completedPercentage, reference });
        correctOnes.forEach(co => {
          const cIndex = this.correctEtps.findIndex(item => item.id === co.id);
          if (cIndex < 0) {
            this.correctEtps.push({ ...co, number: co.number / 20 });
          } else if (this.correctEtps[cIndex].number < 1) this.correctEtps[cIndex].number += (co.number / 20);
        });
        mistakes.forEach(m => {
          const mIndex = this.mistakenEtps.findIndex(item => item.id === m.id);
          if (mIndex < 0) {
            this.mistakenEtps.push(m);
          } else this.mistakenEtps[mIndex].number += m.number;
        });
        this.mistakenEtps.sort((a, b) => b.number - a.number);
      });

      this.lists =
        tests.filter(test => test.reference === ETestReference.practiceLists)
          .map(
            test => {
              const { id, practiceListName, createdAt } = test;
              // return { id, en: practiceListName ?? '', number: test.completedPercentage / 100, date: createdAt } as TEtpTI
              return { id, en: practiceListName ?? '', number: 1, date: createdAt } as TEtpTI
            }
          );

      console.log({ lists: this.lists });

      this.correctEtps.sort((a, b) => a.number - b.number);

      const per = (this.tests.map(t => t.completedPercentage).reduce((a, b) => a + b, 0) * 100) / (tests.length * 100);
      this.completedTestsPercentage = per > 100 ? 100 : per;

      console.log({ correctEtps: this.correctEtps, mistakenEtps: this.mistakenEtps });
    };
    return this._rootSvc.user$.subscribe((userInfo: IUser) => {

      console.log({ userInfo });

      this.etpsTarget = userInfo.monthlyObjective?.etps ?? 0;
      this.practiceListsTarget = userInfo.monthlyObjective?.lists ?? 0;

      this._testSvc.getFilteredTests({ author: userInfo.id }).subscribe(
        tests => {
          console.log({ tests });
          this.tests = tests;
          testsProcess(tests);
          tPss(tests);
        },
        error => console.error({ error })
      )
    }, error => console.error({ error })).unsubscribe();
  }

  ngOnDestroy(): void {
    this.chart.destroy();
  }

}
