import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { CreateComponent } from './components/create/create.component';
import { EditComponent } from './components/edit/edit.component';

import { LoginComponent } from './components/login/login.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RejectionModalComponent } from './components/rejection-modal/rejection-modal.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';
import { BulkFeedbackComponent } from './components/bulk-feedback/bulk-feedback.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CreateComponent,
    EditComponent,
    DashboardComponent,
    LoginComponent,
    UserDashboardComponent,
    RejectionModalComponent,
    BulkUploadComponent,
    BulkFeedbackComponent,
    
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    FontAwesomeModule,
    ButtonModule,
    MessagesModule,
    MessageModule,
    DialogModule,
    ToastModule,
    CardModule,
    TableModule,
    AppRoutingModule,
    GoogleMapsModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
