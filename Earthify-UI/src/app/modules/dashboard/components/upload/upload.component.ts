import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  constructor(private data: SharedService) { }
  file: any = null;
  jobs: any = [];
  processReady = false
  ngOnInit(): void {
    this.getJobs();
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

  getFile(e: any): void {
    this.file = e.target.files[0]
    console.log(this.file)
  }

  processFile(): void {
    const form = new FormData();
    form.append('file', this.file);
    SharedService.loading('create_job', false);
    this.data.apiService('create_job', form).subscribe((result: any) => {
      SharedService.loading('create_job', true);
      SharedService.fire(result.message, !result.status);
      this.getJobs()
    },(error: any) => {
      SharedService.loading('create_job', true);
    })
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
