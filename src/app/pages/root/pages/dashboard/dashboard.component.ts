import { Component, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { localStorageLabels } from '../../../../enums';

import { BubbleDataPoint, Chart, ChartConfiguration, ChartTypeRegistry, Point } from 'chart.js/auto';
import { DateTime } from 'luxon';

import { TestService } from '../test';
import { RootService } from '../../root.service';

import { ETestReference, ITest, IUser } from '../../../../interfaces';
import { Subscription } from 'rxjs';

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

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  public chart!: Chart;

  public etpsTarget: number = 600;
  public practiceListsTarget: number = 30;
  // public etpList: string[] = [];
  // public practiceListsList: number = 0;
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

  get monthlyTarget(): number {
    return this.etpsTarget + this.practiceListsTarget;
  }

  get en(): boolean {
    const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en'
    return en === 'en';
  }

  get monthlyProgress(): number {
    const { length } = this.reports.etps.total;
    return length > 0 ? (length * 100) / this.monthlyTarget : 0;
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
    return this._rootSvc.user$.subscribe((userInfo: IUser) => {
      this._testSvc.getFilteredTests({ author: userInfo.id }).subscribe(
        tests => {
          // console.log({ tests });
          testsProcess(tests);
        },
        error => console.error({ error })
      )
    }, error => console.error({ error })).unsubscribe();
  }

  ngOnDestroy(): void {
    this.chart.destroy();
  }

}
