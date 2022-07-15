import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $: any;
declare var Metro: any;
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  constructor(private data: SharedService) { }
  file: any = null;
  jobs: any = [];
  counties: any = [];
  states: any = [];
  processReady = false
  ngOnInit(): void {
    this.getJobs();
    this.getCounties();
    this.getStates();
  }

  getJobs(): void {
    SharedService.loading('getJob', false)
    this.data.apiGetService('jobs/user').subscribe(
      (result: any) => {
        SharedService.loading('getJob', true)
        this.jobs = result
      }, (e:any) => {
        SharedService.loading('getJob', true)
      })
  }


  getCounties(): void {
    SharedService.loading('get_counties', false)
    this.data.apiGetService('get_counties').subscribe(
      (result: any) => {
        SharedService.loading('get_counties', true)
        this.counties = result
        setTimeout(() => {Metro.getPlugin('#county-list', 'select').reset()}, 300)
      }, (e:any) => {
        SharedService.loading('get_counties', true)
      })
  }

  getStates(): void {
    SharedService.loading('get_states', false)
    this.data.apiGetService('get_states').subscribe(
      (result: any) => {
        SharedService.loading('get_states', true)
        this.states = result
        setTimeout(() => {Metro.getPlugin('#state-list', 'select').reset()}, 300)
      }, (e:any) => {
        SharedService.loading('get_states', true)
      })
  }

  getFile(e: any): void {
    this.file = e.target.files[0]
  }

  checkForInvalid(evt: any): void {
    const ctx = this;
    setTimeout( () => {
      if ($('.invalid').length > 0) {
        SharedService.invalidForm("#data-form");
      } else {
        ctx.processFile(evt)
      }
    }, 200);
  }

  processFile(evt: any): any {
    // evt.preventDefault();
    evt.stopPropagation()
    const form = new FormData();
    form.append('file', this.file);
    SharedService.loading('create_job', false);
    this.data.apiService('create_job', form).subscribe((result: any) => {
      this.file = null;
      SharedService.loading('create_job', true);
      if (result.status){
        this.processJobDetails(result.job_id)
      } else {
        SharedService.fire(result.message, true);
      }
    },(error: any) => {
      this.file = null;
      SharedService.loading('create_job', true);
    });
  }

  processJobDetails(job_id: string): any {
    const formData = $('#data-form').serializeArray()
    const form: any = {job_id: job_id}
    // form.append('job_id', job_id);
    formData.forEach((formField: any) => {
      form[formField.name] = formField.value;
    });
    SharedService.loading('create_job', false);
    this.data.apiService('create_job_details', form).subscribe((result: any) => {
      SharedService.loading('create_job', true);
      SharedService.fire("Job created successfully", false);
      this.getJobs();
    },(error: any) => {
      SharedService.loading('create_job', true);
    });
  }

  getStatus(e: any): string {
    let status = "Unknown";
    switch (e) {
      case 0:
        status = "Submitted"
        break;
      case 1:
        status = "Processed"
        break;
    }
    return status;
  }
}
