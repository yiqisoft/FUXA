import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { EndPointApi } from "../_helpers/endpointapi";

import { LogsRequest } from "../_models/diagnose";
import { Report } from "../_models/report";
import { MailMessage, SmtpSettings } from "../_models/settings";

@Injectable({
    providedIn: "root",
})
export class DiagnoseService {
    private endPointConfig: string = EndPointApi.getURL();

    constructor(private http: HttpClient) {}

    getLogsDir() {
        return this.http.get<string[]>(
            this.endPointConfig + "/scada/api/logsdir"
        );
    }

    getLogs(logReq: LogsRequest): Observable<any> {
        let header = new HttpHeaders({ "Content-Type": "application/json" });
        const requestOptions: Object = {
            /* other options here */
            responseType: "text",
            headers: header,
            params: logReq,
            observe: "response",
        };
        return this.http.get<any>(
            this.endPointConfig + "/scada/api/logs",
            requestOptions
        );
    }

    getReportsDir(report: Report): Observable<string[]> {
        let header = new HttpHeaders({ "Content-Type": "application/json" });
        let params = {
            id: report.id,
            name: report.name,
        };
        return this.http.get<string[]>(
            this.endPointConfig + "/scada/api/reportsdir",
            { headers: header, params: params }
        );
    }

    sendMail(msg: MailMessage, smtp: SmtpSettings) {
        return new Observable((observer) => {
            if (environment.serverEnabled) {
                let header = new HttpHeaders({
                    "Content-Type": "application/json",
                });
                let params = { msg: msg, smtp: smtp };
                this.http
                    .post<any>(this.endPointConfig + "/scada/api/sendmail", {
                        headers: header,
                        params: params,
                    })
                    .subscribe(
                        (result) => {
                            observer.next();
                        },
                        (err) => {
                            console.error(err);
                            observer.error(err);
                        }
                    );
            } else {
                observer.next();
            }
        });
    }
}
