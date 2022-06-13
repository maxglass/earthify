import { Component, OnInit } from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var Metro:any;
declare var $:any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  searchDelayId: any = -1;
  market:any = {items: [], links: []};
  constructor(private data: SharedService) {
  }

  ngOnInit(): void {
    this.getMarketData();
    const ctx = this;
    $(document).on('click','.edit-user', (e: any) => {
      const index = e.target.getAttribute('value');
      ctx.editUser(this.market.items[index])
    })
    $(document).on('click','.del-user', (e: any) => {
      const index = e.target.getAttribute('value');
      ctx.delUser(this.market.items[index])
    })
  }

  getMarketData(url: string = '?page=1'): void {
    let page: any = url.split("=");
    let perPage: any = Number($('#per-page').val());
    page = page[page.length -1];
    if (perPage != this.market.per_page){
      // page = 1
    }
    let search = $('#search').val();
    if (search.trim().length === 0) {
      search = '%';
    } else {
      search = `%${search}%`;
    }
    SharedService.loading('marketplace');
    this.data.apiGetService(`users?page=${page}&size=${perPage}`).subscribe(
      (result: any) => {
        SharedService.loading('marketplace', true);
        this.market = result;
        $('#per-page').off('change');
        Metro.getPlugin('#per-page', 'select').val(result.per_page);
        $('#per-page').on('change', ()=>{
          $('#per-page').off('change');
          this.getMarketData()
        });
        $('#user-table tbody').empty();
        const table = $('#user-table').data('table');
        let head: any = [];
        const col = ['email', 'first_name', 'last_name', 'time_created', 'role_id'];
        const titles = ['Email', 'First Name', 'Last Name', 'Created On', 'Role'];
        col.forEach((c: any, index) => {
          head.push(
            {
              "name": c,
              "title": titles[index],
              "sortable": false
            }
          );
        });
        head.push(
          {
            "name": "Actions",
            "title": "Actions",
            "sortable": false
          }
        );
        if (result.items.length > 0) {
          const table = $('#user-table').data('table');
          const rows: any = [];


          result.items.forEach((d: any, i: number) => {
            let data: any = [];
            col.forEach((c: any) => {
              if (c == 'role_id') {
                switch (d[c]) {
                  case 0:
                    data.push(`Admin`);
                    break;
                  case 1:
                    data.push(`Data`);
                    break;
                  case 2:
                    data.push(`Viewer`);
                    break;
                  case 3:
                    data.push(`Quality Control`);
                    break;
                }
              } else {
                data.push(`${d[c]}`);
              }

            });
            if (d["role_id"] !== 0) {
              data.push(`
<button value="${i}" class="edit-user button small light">Edit</button>
<button value="${i}" class="del-user button small alert">Delete</button>
`)
            }
            rows.push(data);
          });
          table.setData({header: head, data: rows});
          table.draw();
        } else {
          table.setData({header: head, data: []});
          table.draw();
        }

      },
      (error: any) => {
        SharedService.loading('marketplace', true);
      }
    )
  }

  onSearch(e: any): void {
    const val = $('#search').val();
    if ((e.keyCode == 13) || e.keyCode == undefined) {
      this.getMarketData();
      return;
    }
    clearTimeout(this.searchDelayId);
    this.searchDelayId = setTimeout(() => {
      const currentVal = $('#search').val();
      if ((val == currentVal && currentVal.length > 0) || this.market.items.length == 0) {
        this.getMarketData();
      }
    }, 1000);
  }

  openProperty(id: string): void {

  }
  buyGrid(id: string): void {

  }

  logout(): void {
    this.data.logOut();
  }

  editUser(data: any): void {
    const ctx = this;
    const html = `<div id="property-error-div"></div><div class="form-group">
<input type="text" id="first-name" data-role="materialinput" value="${data['first_name']}"
       placeholder="Enter first name"
       data-icon="<span class='mif-info'>"
       data-label="First name"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
><input type="text" id="last-name" data-role="materialinput" value="${data['last_name']}"
       placeholder="Enter first name"
       data-icon="<span class='mif-info'>"
       data-label="First name"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
><select type="text" id="role" data-role="select" value="${data['role_id']}"
       data-icon="<span class='mif-info'>"
       data-label="Role"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
>
<option value="1">Data</option>
<option value="2">Viewer</option>
<option value="3">QC</option>
</select></div>`;
    Metro.dialog.create({
      title: "Edit User",
      content: html,
      clsDialog: 'buy-land-dialog',
      actions: [
        {
          caption: "Update",
          cls: "success",
          onclick: function(){
            const name = $('#property-name').val();
            if (name.length < 2) {
              $('#property-error-div').empty().append("Property name must be at least 2 characters");
              SharedService.invalidForm('#property-error-div');
              return;
            }
            Metro.dialog.close('.buy-land-dialog');
            // ctx.buyLandRequest(name);
          }
        },
        {
          caption: "Cancel",
          cls: "js-dialog-close light",
          onclick: function(){

          }
        }
      ]
    });
  }

  delUser(data: any): void {
    const ctx = this;
    Metro.dialog.create({
      title: "Delete User",
      content: "Do you want to delete user " + data['email'] + "?",
      clsDialog: 'buy-land-dialog',
      actions: [
        {
          caption: "Yes, Delete!",
          cls: "alert",
          onclick: function(){

            Metro.dialog.close('.buy-land-dialog');
            // ctx.buyLandRequest(name);
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
}
