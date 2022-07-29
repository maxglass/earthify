import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $: any;
declare var Metro: any;
@Component({
  selector: 'app-data-schema',
  templateUrl: './data-schema.component.html',
  styleUrls: ['./data-schema.component.css']
})
export class DataSchemaComponent implements OnInit {

  constructor(private data: SharedService) { }

  columns: any = [];
  ngOnInit(): void {
    this.getSchema();
  }

  getSchema(): void {
    this.columns = [];
    SharedService.loading('get_schema_column');
    this.data.apiGetService('get_schema_column').subscribe(
      (result: any) => {
        SharedService.loading('get_schema_column', true);
        result.forEach((c:any) => {
          if (['id', 'attributes', 'geometry', 'job_id'].indexOf(c.column_name) === -1) {
            this.columns.push(c.column_name);
          }
        })
        console.log(this.columns);
      },
      (err: any) => {
        SharedService.loading('get_schema_column', true);
      }
    )
  }

  delColumn(column: string): void {
    SharedService.loading('del_schema_column', false);
    this.data.apiGetService('del_schema_column/'+column).subscribe(
      (result: any) => {
        SharedService.fire("Schema updated successfully", false)
        SharedService.loading('del_schema_column', true);
        this.getSchema();
      },
      (error: any) => {
        SharedService.fire("Failed to update schema", true)
        SharedService.loading('del_schema_column', true);

      })
  }

  addColumn(): void {
    const ctx = this;
    const html = `<div id="property-error-div"></div><div class="form-group">
<input type="text" id="field-name" data-role="materialinput"
       placeholder="Enter field name"
       data-icon="<span class='mif-info'>"
       data-label="Field name"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
></div>`;
    Metro.dialog.create({
      title: "Please enter field name",
      content: html,
      clsDialog: 'field-dialog',
      actions: [
        {
          caption: "Buy",
          cls: "success",
          onclick: function(){
            const name = $('#field-name').val();
            if (name.length < 2) {
              $('#property-error-div').empty().append("Field name must be at least 2 characters");
              SharedService.invalidForm('#property-error-div');
              return;
            }
            Metro.dialog.close('.field-dialog');
            ctx.postAddColumn(name);
          }
        },
        {
          caption: "No",
          cls: "js-dialog-close light",
          onclick: function(){

          }
        }
      ]
    });
  }

  postAddColumn(column: string): void {
    SharedService.loading('add_schema_column', false);
    this.data.apiGetService('add_schema_column/'+column).subscribe(
      (result: any) => {
        SharedService.fire("Schema updated successfully", false)
        SharedService.loading('add_schema_column', true);
        this.getSchema();
      },
      (error: any) => {
        SharedService.fire("Failed to update schema", true)
        SharedService.loading('add_schema_column', true);

      })
  }

}
