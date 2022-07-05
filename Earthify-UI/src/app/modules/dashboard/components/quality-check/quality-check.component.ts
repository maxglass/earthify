import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $:any;
declare var Metro:any;
@Component({
  selector: 'app-quality-check',
  templateUrl: './quality-check.component.html',
  styleUrls: ['./quality-check.component.css']
})
export class QualityCheckComponent implements OnInit {

  constructor(private data: SharedService) { }
  jobs: any = []
  job:any = {name: '', columns: [], details: {}};
  currentJob = {job_id: '', status: 1};
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

  getJobColumn(job: any): void {
    this.currentJob = job;
    SharedService.loading('getJobCol', false)
    this.data.apiGetService('jobs/'+job.job_id).subscribe(
      (result: any) => {
        SharedService.loading('getJobCol', true)
        this.job.columns = result.columns
        this.job.details = result.details
        this.job.name = result.name;
        $('#user-table tbody').empty();
        const table = $('#user-table').data('table');
        let head: any = [];
        const col = Object.keys(result.attributes);
        col.forEach((c: any, index) => {
          head.push(
            {
              "name": c,
              "title": c,
              "sortable": false
            }
          );
        });
        if (result.attributes != null) {
          const table = $('#grid-table').data('table');
          const rows: any = [];

          const attrRows: any = Object.values(result.attributes)
          Object.values(attrRows[0]).forEach((d: any, i: number) => {
            let data: any = [];
            col.forEach((c: any) => {
                data.push(result.attributes[c][i]);
            });
            rows.push(data);
          });
          console.log(rows)
          table.setData({header: head, data: rows});
          table.draw();
        } else {
          table.setData({header: head, data: []});
          table.draw();
        }
        Metro.dialog.open('#job-detail-dialog')
      }, (e:any) => {
        SharedService.loading('getJobCol', true)
      })
  }

  deleteJob(job: any): void {
    this.currentJob = job;
    const ctx = this;
    Metro.dialog.create({
      title: "Bid",
      content: `Do you want to delete this job (${job.job_id})?`,
      actions: [
        {
          caption: "Yes Delete!",
          cls: "js-dialog-close alert",
          onclick: function(){
            ctx.postDelJob();
          }
        },
        {
          caption: "No",
          cls: "js-dialog-close success",
          onclick: function(){

          }
        }
      ]
    });

  }

  postDelJob(): void {
    SharedService.loading('deleteJob', false)
    this.data.apiGetService('jobs/delete/'+this.currentJob.job_id).subscribe(
      (result: any) => {
        SharedService.loading('deleteJob', true)
        SharedService.fire("Job deleted successfully", false);
        this.getJobs()
      }, (e:any) => {
        SharedService.loading('deleteJob', true)
      })
  }

  processJob(): void {
    const body: any = {job_id: this.currentJob.job_id, col1: '', col2: '', col3: ''}
    const cols = Metro.getPlugin('#standard-columns', 'drag-items')
    cols.component.childNodes.forEach((c: any, i: number) => {
      if (i < 3) {
        body['col'+(i+1)] = c.innerText;
      }
    });
    SharedService.loading('process_job', false);
    this.data.apiService('job/process', body).subscribe((result: any) => {
      SharedService.loading('process_job', true);
      SharedService.fire(result.message, !result.status);
      if (result.status){
        Metro.dialog.close('#job-detail-dialog');

      }
    },(error: any) => {
      SharedService.loading('process_job', true);
    });
  }

  checkForInvalid(evt: any): void {
    const ctx = this;
    setTimeout( () => {
      console.log('checking')
      if ($('.invalid').length > 0) {
        SharedService.invalidForm("#data-form");
      } else {
        // ctx.processFile(evt)
      }
    }, 200);
  }

}
