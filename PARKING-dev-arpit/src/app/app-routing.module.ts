import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component'; // Import your component
import { CreateComponent } from './components/create/create.component';
import { MapComponent } from './components/map/map.component';
import { EditComponent } from './components/edit/edit.component';
import { LoginComponent } from './components/login/login.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';
import { BulkFeedbackComponent } from './components/bulk-feedback/bulk-feedback.component';
// import { SidebarComponent } from './sidebar/sidebar.component';
const routes: Routes = [
     
     { path: 'way', component: LoginComponent }, // Default route (login page)

     // Admin Routes
     { path: 'way/admin', component: DashboardComponent }, // Admin dashboard
     { path: 'way/admin/editor', component: MapComponent }, // Admin editor

     { path: 'way/user', component: UserDashboardComponent }, // User dashboard
     { path: 'way/user/editor', component: MapComponent }, // User editor

     { path: 'bulk-upload', component: BulkUploadComponent,outlet:'popup'},
  { path: 'bulk-feedback', component: BulkFeedbackComponent,outlet:'popup' },
   
     // Other routes
     { path: 'create', component: CreateComponent ,outlet:'popup'}, // Create
     { path: 'update', component: EditComponent ,outlet:'popup'}, // Update
   
     // Catch-all route (redirect to login if no matching route is found)
     { path: '**', redirectTo: 'way' },
     { path: '*', redirectTo: 'way' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

