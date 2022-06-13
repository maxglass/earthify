import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $:any;
@Component({
  selector: 'app-quality-check',
  templateUrl: './quality-check.component.html',
  styleUrls: ['./quality-check.component.css']
})
export class QualityCheckComponent implements OnInit {

  constructor(private data: SharedService) { }
  jobs: any = []
  columns:any = [];
  currentJob = "";
  ngOnInit(): void {
    this.getJobs()
  }


  getJobs(): void {
    SharedService.loading('getJob', false)
    this.data.apiGetService('jobs').subscribe(
      (result: any) => {
        SharedService.loading('getJob', true)
        this.jobs = result
      }, (e:any) => {
        SharedService.loading('getJob', true)
      })
  }

  getJobColumn(id: any): void {
    this.currentJob = id;
    SharedService.loading('getJobCol', false)
    this.data.apiGetService('jobs/'+id).subscribe(
      (result: any) => {
        SharedService.loading('getJobCol', true)
        $('#job-col').empty();
        result.forEach((data: any) => {
          $('#job-col').append(`<li>${data}</li>`)
        })
      }, (e:any) => {
        SharedService.loading('getJobCol', true)
      })
  }

  processJob(): void {

  }

}
