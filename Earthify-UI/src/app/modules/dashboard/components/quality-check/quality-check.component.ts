import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";
import {bbox} from '@turf/turf';
declare var $:any;
declare var Metro:any;
declare const mapboxgl: any;

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
  map:any;
  geoJsonData:any = {}
  properties : any = {}
  bounds : any = {}
  jsonCount = 0;
  ngOnInit(): void {
    this.getJobs();
    this.initMap();
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

  initMap(): void {
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      center: [-93.5653521,37.7931689], // starting position
      zoom: 3,
      accessToken: SharedService.accessToken,
      style: 'mapbox://styles/mapbox/satellite-streets-v11'
    });
    console.log(this.map);
    this.map.on('click', (e: any) => {
      const selectedFeatures = this.map.queryRenderedFeatures(e.point, {
        layers: ['maine']
      });
      if (selectedFeatures.length > 0) {
        this.properties = selectedFeatures[0].properties;
        Metro.dialog.open('#info-dialog')
      }
    })
  }

  addGeoJSON(data: any): void {
    this.geoJsonData = data;
    if(this.map.getLayer('maine') !== undefined) {
      this.map.removeLayer('maine')
    }
    if(this.map.getSource('maine') !== undefined) {
      this.map.removeSource('maine')
    }
    this.map.addSource('maine', {
      'type': 'geojson',
      'data': data
    });
    this.map.addLayer({
      'id': 'maine',
      'type': 'fill',
      'source': 'maine', // reference the data source
      'layout': {},
      'paint': {
        'fill-color': 'red', // blue color fill
        'fill-opacity': 0.5,
        'fill-outline-color': 'white'
      }
    });
    let bounds = bbox(data);
    this.bounds = new mapboxgl.LngLatBounds(
      [bounds[2],bounds[1]],
      [bounds[0], bounds[1]]
    );
    this.map.fitBounds(this.bounds, {
      padding: 20
    });

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
        $('#grid-table tbody').empty();
        const table = $('#grid-table').data('table');
        let head: any = [];
        const col = Object.keys(result.attributes[0]);
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
          const rows: any = [];

          const attrRows: any = Object.values(result.attributes)
          result.attributes.forEach((d: any, i: number) => {
            let data: any = [];
            col.forEach((c: any) => {
                data.push(d[c]);
            });
            rows.push(data);
          });
          console.log(head)
          console.log(rows)
          table.setData({header: head, data: rows});
          table.draw();
        } else {
          table.setData({header: head, data: []});
          table.draw();
        }
        this.addGeoJSON(result.map)
        Metro.dialog.open('#job-detail-dialog')
      }, (e:any) => {
        SharedService.loading('getJobCol', true)
      })
  }

  resizeMap(): void {
    setTimeout(() => {
      this.map.resize();
      this.map.fitBounds(this.bounds, {
        padding: 20
      });
    }, 500)
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
    if (this.currentJob.status != 0) {
      SharedService.fire('Job already processed', true);
      return;
    }
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
        this.getJobs()
      }
    },(error: any) => {
      SharedService.loading('process_job', true);
    });
  }

  checkForInvalid(evt: any): void {
    if (this.currentJob.status != 0) {
      SharedService.fire('Job already processed', true);
      return;
    }
    const ctx = this;
    setTimeout( () => {
      console.log('checking')
      if ($('.invalid').length > 0) {
        SharedService.invalidForm("#data-form");
      } else {
        ctx.processJobDetails()
      }
    }, 200);
  }

  processJobDetails(): any {
    const formData = $('#data-form').serializeArray()
    const form: any = {job_id: this.currentJob.job_id}
    // form.append('job_id', job_id);
    formData.forEach((formField: any) => {
      form[formField.name] = formField.value;
    });
    SharedService.loading('update_job_details', false);
    this.data.apiService('update_job_details', form).subscribe((result: any) => {
      SharedService.loading('update_job_details', true);
      SharedService.fire("Job updated successfully", false);
      Metro.dialog.close('#job-detail-dialog');
      this.getJobs();
    },(error: any) => {
      SharedService.loading('update_job_details', true);
      SharedService.fire("Job updated failed", true);
    });
  }

}
