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
  users:any = {items: [], links: []};
  currentPage = 1;
  constructor(private data: SharedService) {
  }

  ngOnInit(): void {
    this.getUsersData();
    const ctx = this;
    $(document).on('click','.edit-user', (e: any) => {
      const index = e.target.getAttribute('value');
      ctx.editUser(this.users.items[index])
    })
    $(document).on('click','.del-user', (e: any) => {
      const index = e.target.getAttribute('value');
      ctx.delUser(this.users.items[index])
    })
    $(document).on('click','.password-user', (e: any) => {
      const index = e.target.getAttribute('value');
      ctx.changeUserPass(this.users.items[index])
    })
  }

  getUsersData(url: string = '?page=1'): void {
    let page: any = url.split("=");
    let perPage: any = Number($('#per-page').val());
    page = page[page.length -1];
    if (perPage != this.users.per_page){
      // page = 1
    }
    let search = $('#search').val();
    if (search.trim().length === 0) {
      search = '%';
    } else {
      search = `%${search}%`;
    }
    SharedService.loading('users');
    this.data.apiGetService(`users?page=${page}&size=${perPage}`).subscribe(
      (result: any) => {
        SharedService.loading('users', true);
        this.users = result;
        $('#per-page').off('change');
        Metro.getPlugin('#per-page', 'select').val(result.per_page);
        $('#per-page').on('change', ()=>{
          $('#per-page').off('change');
          this.getUsersData()
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
                    data.push(`Standardize`);
                    break;
                  case 3:
                    data.push(`Normalize`);
                    break;
                  case 4:
                    data.push(`Viewer`);
                    break;
                }
              } else {
                data.push(`${d[c]}`);
              }

            });
            if (d["role_id"] !== 0) {
              data.push(`
<button value="${i}" class="edit-user button small light">Edit</button>
<button value="${i}" class="password-user button small info">Change Password</button>
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
        SharedService.loading('users', true);
      }
    )
  }

  onSearch(e: any): void {
    const val = $('#search').val();
    if ((e.keyCode == 13) || e.keyCode == undefined) {
      this.getUsersData();
      return;
    }
    clearTimeout(this.searchDelayId);
    this.searchDelayId = setTimeout(() => {
      const currentVal = $('#search').val();
      if ((val == currentVal && currentVal.length > 0) || this.users.items.length == 0) {
        this.getUsersData();
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
    const html = `<ul id="property-error-div"></ul><div class="form-group">
<input type="text" id="first-name" data-role="materialinput" value="${data['first_name']}"
       placeholder="Enter first name"
       data-icon="<span class='mif-info'>"
       data-label="First name"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
       data-validate="required minlength=2"
><input type="text" id="last-name" data-role="materialinput" value="${data['last_name']}"
       placeholder="Enter last name"
       data-icon="<span class='mif-info'>"
       data-label="First name"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
       data-validate="required minlength=2"
><select type="text" id="role" data-role="select" value="${data['role_id']}"
       data-icon="<span class='mif-info'>"
       data-label="Role"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
>
<option value="1">Data</option>
<option value="2">Standardize</option>
<!--<option value="3">Normalize</option>-->
<option value="4">Viewer</option>
</select></div>`;
    Metro.dialog.create({
      title: "Edit User",
      content: html,
      clsDialog: 'edit-user-dialog top-dialog',
      actions: [
        {
          caption: "Update",
          cls: "success",
          onclick: function(){
            $('#property-error-div').empty();
            const validate = Metro.validator;
            const fname = $('#first-name');
            const lname = $('#last-name');
            const role = $('#role');
            const errors = [];

            if (!validate.validate(fname)) {
              errors.push("First name must be at least 2 characters");
            }
            if (!validate.validate(lname)) {
              errors.push("Last name must be at least 2 characters");
            }
            if (errors.length > 0 ) {
              errors.forEach((error: any) => {
                $('#property-error-div').append(`<li>${error}</li>`)
              });
              setTimeout(() => {$('#property-error-div').empty();}, 5000);
              SharedService.invalidForm('#property-error-div');
              return;
            }
            Metro.dialog.close('.edit-user-dialog');
            ctx.postEditUser({
              email: data.email,
              first_name: fname.val(),
              last_name: lname.val(),
              role_id: role.val(),
            })
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

  postEditUser(body: any): void {
    SharedService.loading('update_user', false);
    this.data.apiService('user/update', body).subscribe((result: any) => {
      SharedService.loading('update_user', true);
      SharedService.fire("User updated successfully", false);
      this.getUsersData();
    },(error: any) => {
      SharedService.loading('update_user', true);
    });
  }

  changeUserPass(data: any): void {
    const ctx = this;
    const html = `<ul id="property-error-div"></ul><div class="form-group">
<input type="text" id="password" name="password" data-role="materialinput"
       placeholder="Enter Password"
       data-icon="<span class='mif-lock'>"
       data-label="New Password"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
       data-validate="required minlength=8"
><input type="text" id="repassword" name="repassword" data-role="materialinput"
       placeholder="Renter Password"
       data-icon="<span class='mif-lock'>"
       data-label="Renter Password"
       data-cls-line="bg-cyan"
       data-cls-label="fg-cyan"
       data-cls-informer="fg-lightCyan"
       data-cls-icon="fg-darkCyan"
       data-validate="required compare=password"
>
</div>`;
    Metro.dialog.create({
      title: "Change User Password",
      content: html,
      clsDialog: 'edit-password-dialog top-dialog',
      actions: [
        {
          caption: "Change",
          cls: "success",
          onclick: function(){
            $('#property-error-div').empty();
            const validate = Metro.validator;
            const password = $('#password');
            const repass = $('#repassword');
            const errors = [];

            if (!validate.validate(repass)) {
              errors.push("Password must be matched and 8 character long");
            }
            if (errors.length > 0 ) {
              errors.forEach((error: any) => {
                $('#property-error-div').append(`<li>${error}</li>`)
              });
              setTimeout(() => {$('#property-error-div').empty();}, 5000);
              SharedService.invalidForm('#property-error-div');
              return;
            }
            Metro.dialog.close('.edit-password-dialog');
            // ctx.buyLandRequest(name);
            ctx.postChangePassword({
              email: data.email,
              password: password.val()
            })
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


  postChangePassword(body: any): void {
    SharedService.loading('password_user', false);
    this.data.apiService('user/change/password', body).subscribe((result: any) => {
      SharedService.loading('password_user', true);
      SharedService.fire("User password changed successfully", false);
      this.getUsersData();
    },(error: any) => {
      SharedService.loading('password_user', true);
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
            ctx.postDeleteUser(data['email']);
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


  postDeleteUser(id: any): void {
    SharedService.loading('delete_user', false);
    this.data.apiGetService('user/delete/'+id).subscribe((result: any) => {
      SharedService.loading('delete_user', true);
      SharedService.fire("User deleted successfully", false);
      this.getUsersData();
    },(error: any) => {
      SharedService.loading('delete_user', true);
    });
  }

  addUser(): void {
    const ctx = this;
    const html = `
<div class="form-group">
<input autocomplete="off" type="text" id="first_name" data-role="materialinput"
 placeholder="Enter first name"
 data-icon="<span class='mif-info'>"
 data-label="First Name"
 data-cls-line="bg-cyan"
 data-cls-label="fg-cyan"
 data-cls-informer="fg-lightCyan"
 data-cls-icon="fg-darkCyan"
 data-validate="required minlength=3"
>
<input autocomplete="off" type="text" id="last_name" data-role="materialinput"
 placeholder="Enter last name"
 data-icon="<span class='mif-info'>"
 data-label="Last Name"
 data-cls-line="bg-cyan"
 data-cls-label="fg-cyan"
 data-cls-informer="fg-lightCyan"
 data-cls-icon="fg-darkCyan"
 data-validate="required minlength=3"
>
<input autocomplete="off" type="email" id="email" data-role="materialinput"
 placeholder="Enter email"
 data-icon="<span class='mif-envelop'>"
 data-label="Email"
 data-cls-line="bg-cyan"
 data-cls-label="fg-cyan"
 data-cls-informer="fg-lightCyan"
 data-cls-icon="fg-darkCyan"
 data-validate="required email"
>
<input autocomplete="off" type="password" name="password" id="password" data-role="materialinput"
 placeholder="Enter new password"
 data-icon="<span class='mif-lock'>"
 data-label="New Password"
 data-cls-line="bg-cyan"
 data-cls-label="fg-cyan"
 data-cls-informer="fg-lightCyan"
 data-cls-icon="fg-darkCyan"
 data-validate="required"
>
<input autocomplete="off" type="password" id="re-password" data-role="materialinput"
 placeholder="Retype new password"
 data-icon="<span class='mif-lock'>"
 data-label="Retype New Password"
 data-cls-line="bg-cyan"
 data-cls-label="fg-cyan"
 data-cls-informer="fg-lightCyan"
 data-cls-icon="fg-darkCyan"
 data-validate="required compare=password minlength=8"
>
<select autocomplete="off" type="text" id="user-role" data-role="select"
 placeholder="Select user role"
 data-icon="<span class='mif-users'>"
 data-label="User Role"
 data-cls-line="bg-cyan"
 data-cls-label="fg-cyan"
 data-cls-informer="fg-lightCyan"
 data-cls-icon="fg-darkCyan"
>
<option value="1">Data</option>
<option value="2">Standardize</option>
<!--<option value="3">Normalize</option>-->
<option value="4" selected>Viewer</option>
</select>
<ul id="property-error-div" class="fg-red"></ul>
</div>`;
    Metro.dialog.create({
      title: `New User`,
      content: html,
      clsDialog: 'add-user-dialog top-dialog',
      actions: [
        {
          caption: "Add User",
          cls: "dark",
          onclick: function(){
            $('#property-error-div').empty();
            const validator = Metro.validator;
            const errors: any = [];
            const fname = $("#first_name"); // for input must be defined validation functions
            const lname = $("#last_name"); // for input must be defined validation functions
            const email = $('#email');
            const rePass = $('#re-password');
            if (!validator.validate(fname)) {
              errors.push("First name should be at least of 3 characters");
            }
            if (!validator.validate(lname)) {
              errors.push("Last name should be at least of 3 characters");
            }
            if (!validator.validate(email)) {
              errors.push("Email is not valid");
            }
            if (!validator.validate(rePass)) {
              errors.push("Passwords must me matched. With minimum 8 characters");
            }
            if (errors.length > 0) {
              errors.forEach((error: any) => {
                $('#property-error-div').append(`<li>${error}</li>`);
              });
              setTimeout(()=>{$('#property-error-div').empty()},5000)
              SharedService.invalidForm('#property-error-div');
              return;
            }
            Metro.dialog.close('.add-user-dialog');
            ctx.postAddUser({
              first_name: fname.val(),
              last_name: lname.val(),
              email: email.val(),
              password: rePass.val(),
              role_id: $('#user-role').val(),
            });
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
    setTimeout(() => {$('#email, #password').val('')}, 1000)
  }

  postAddUser(body: any): void {
    SharedService.loading('add-user', false);
    this.data.apiService('user/add', body).subscribe(
      (results: any) => {
        SharedService.loading('add-user', true);
        SharedService.fire(results.message, !results.status);
        if (results.status) {
          this.getUsersData();
        }
      },
      (error: any) => {
        SharedService.loading('add-user', true);

      }
    )
  }
}
