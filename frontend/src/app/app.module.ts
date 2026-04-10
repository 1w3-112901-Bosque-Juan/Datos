import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { CatalogComponent } from './components/catalog.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'catalog', component: CatalogComponent }
];

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes), LoginComponent, CatalogComponent],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
