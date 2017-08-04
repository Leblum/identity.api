/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { HomeComponent } from './home/home.component';


export const ApplicationRoutes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'email-verification', component: EmailVerificationComponent}
];

export const ApplicationRouting: ModuleWithProviders = RouterModule.forRoot(ApplicationRoutes);
