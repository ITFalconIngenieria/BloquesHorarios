import { Injectable } from '@angular/core';
import { HorarioModel } from '@model/horario-model';
import { MatrizHorariaModel } from '@model/matriz-horaria-model';
import { TableViewModel } from '@model/table-view-model';
import {BloqueHorarioService} from '@service/bloqueHorario.service';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as moment from 'moment-timezone';
import { MatrizHorariaTransferObject } from '@data-transfer/matriz-horaria-transfer-object';
import { BloqueHorarioTransferObject } from '@data-transfer/bloque-horario-transfer-object';
import { ClaseDiaModel } from '@model/clase-dia-model';
import { PeriodoModel } from '@model/periodo-model';
import { HorarioTransferObject } from '@data-transfer/horario-transfer-object';


@Injectable({
    providedIn: 'root'
})

export class ComponentService{
    constructor(
        private BloqueHorarioService: BloqueHorarioService,
        private AlertService: NzMessageService
    ){}

    async getInitialData(): Promise<any>{
        let MatrizHorariaData: MatrizHorariaModel[] = [];
        let MatrizHorariaKey: Number = 0;
        let BloqueHorarioData: any[]= [];
        let TableDataView: TableViewModel[]= [];
        let DisbleHoursList: Number[][] = [];
        try{
            MatrizHorariaData = await this.BloqueHorarioService.getMatrizHoraria().toPromise();
            MatrizHorariaKey = MatrizHorariaData[0].id;
            const preDataBloqueHorario = await this.BloqueHorarioService.getBloqueHorario(MatrizHorariaKey).toPromise();
            const groupedData = _.groupBy(preDataBloqueHorario,entity => entity.claseDia.nombre);
            BloqueHorarioData = Object.values(groupedData);
            BloqueHorarioData.forEach(element=>{
                let tempObject: TableViewModel = { 
                    IdBloques:[],
                    Tiempo:{
                      TotalHoras: [],
                      Horarios: [],
                      HorarioString: []
                    }
                };
                tempObject.ClaseDia = element[0].claseDia.nombre;
                element.forEach(item =>{
                    tempObject.IdBloques.push(item.id);
                });
                TableDataView.push(tempObject);
            })

            for(const element of TableDataView){
                let hourArray: Number[] = [];
                for(const item of element.IdBloques){
                    try{
                        const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                        let totalHorasTemp: number = 0;
                        let horarioStringTemp: String = '';
                        let horarioActual: String;
                        let tempHorarioObject:Array<{Horario:String,Id:Number}> =[];
                        for(const itm of result){
                            hourArray.push(moment(itm.horaInicio).hours());
                            hourArray.push(moment(itm.horaFinal).hours());
                            horarioActual = moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH');
                            if(moment(itm.horaFinal).hours() > moment(itm.horaInicio).hours()){
                                totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
                            }else{
                                totalHorasTemp+= (moment(itm.horaFinal).hours()+24) - moment(itm.horaInicio).hours();
                            }
                            horarioStringTemp+= horarioActual + '\n';
                            tempHorarioObject.push({Id:itm.id,Horario:horarioActual});
                        }
                        element.Tiempo.Horarios.push(tempHorarioObject);
                        element.Tiempo.HorarioString.push(horarioStringTemp);
                        element.Tiempo.TotalHoras.push(totalHorasTemp);
                    }catch(error){
                        this.handleError(error);
                    }
                }
                DisbleHoursList.push(hourArray);
            }
            //Retorna Los Valores reales ya que no son argumentos por referencia y se pierde la data al terminar la funcion
            return {
                MHD: MatrizHorariaData,
                MHK: MatrizHorariaKey,
                BHD: BloqueHorarioData,
                TDV: TableDataView,
                DHL: DisbleHoursList
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async updateBloquesHorarios(id: Number): Promise<any>{
        let BloqueHorarioData: any[] = [];
        let TableDataView: TableViewModel[]= [];
        let DisbleHoursList: Number[][] = [];
        try{
            const preDataBloqueHorario = await this.BloqueHorarioService.getBloqueHorario(id).toPromise();
            const groupedData = _.groupBy(preDataBloqueHorario,entity => entity.claseDia.nombre);
            BloqueHorarioData = Object.values(groupedData);
            BloqueHorarioData.forEach(element=>{
                let tempObject: TableViewModel = { 
                    IdBloques:[],
                    Tiempo:{
                      TotalHoras: [],
                      Horarios: [],
                      HorarioString: []
                    }
                };
                tempObject.ClaseDia = element[0].claseDia.nombre;
                element.forEach(item =>{
                    tempObject.IdBloques.push(item.id);
                });
                TableDataView.push(tempObject);
            });
            for(const element of TableDataView){
                let hourArray: Number[] = [];
                for(const item of element.IdBloques){
                    try{
                        const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                        let totalHorasTemp: number = 0;
                        let horarioStringTemp: String = '';
                        let horarioActual: String;
                        let tempHorarioObject:Array<{Horario:String,Id:Number}> = [];
                        for(const itm of result){
                            hourArray.push(moment(itm.horaInicio).hours());
                            hourArray.push(moment(itm.horaFinal).hours());
                            horarioActual = moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH');
                            if(moment(itm.horaFinal).hours() > moment(itm.horaInicio).hours()){
                                totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
                            }else{
                                totalHorasTemp+= (moment(itm.horaFinal).hours()+24) - moment(itm.horaInicio).hours();
                            }
                            horarioStringTemp+= horarioActual + '\n';
                            tempHorarioObject.push({Id:itm.id,Horario:horarioActual});
                        }
                        element.Tiempo.Horarios.push(tempHorarioObject);
                        element.Tiempo.HorarioString.push(horarioStringTemp);
                        element.Tiempo.TotalHoras.push(totalHorasTemp);
                    }catch(error){
                        this.handleError(error);
                    }
                    
                }
                DisbleHoursList.push(hourArray);
            }

            return {
                BHD: BloqueHorarioData,
                TDV: TableDataView,
                DHL: DisbleHoursList
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async updateMatrizHoraria(MatrizHorariaKey: Number): Promise<any>{
        let MatrizHorariaData: MatrizHorariaModel[] = [];
        try{
            MatrizHorariaData = await this.BloqueHorarioService.getMatrizHoraria().toPromise();
            const {BHD,TDV,DHL} = await this.updateBloquesHorarios(MatrizHorariaKey);
            return {
                MHD: MatrizHorariaData,
                BHD: BHD,
                TDV: TDV,
                DHL: DHL
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async postMatrizHoraria(object: MatrizHorariaTransferObject): Promise<MatrizHorariaModel[]>{
        try{
            const responseId: Number = await (await this.BloqueHorarioService.postMatrizHoraria(object).toPromise()).id;
            await this.autoGenerateBloqueHorario(responseId);
            this.AlertService.success("Matriz Horaria Creada");
            return await this.BloqueHorarioService.getMatrizHoraria().toPromise();
        }catch(error){
            this.handleError(error);
        }
    }

    async postBloqueHorario(object: BloqueHorarioTransferObject): Promise<void>{
        try {
            await this.BloqueHorarioService.postBloqueHorario(object).toPromise();
        } catch (error) {
            this.handleError(error);
        }
    }

    async autoGenerateBloqueHorario(id: Number): Promise<void>{
        try {
            const clasesDias: ClaseDiaModel[] = await this.BloqueHorarioService.getClaseDia().toPromise();
            const periodos: PeriodoModel[] = await this.BloqueHorarioService.getPeriodo().toPromise();
            let postObjects: BloqueHorarioTransferObject[] = [];

            for(const dia of clasesDias){
                for(const periodo of periodos){
                    let bodyObject: BloqueHorarioTransferObject = {
                        claseDiaId: dia.id,
                        estado: true,
                        periodoId: periodo.id,
                        matrizHorariaId: id,
                        descripcion: ' ',
                        observacion: ' '
                      }
                      postObjects.push(bodyObject);
                }
            }

            for(const element of postObjects){
                try {
                    await this.postBloqueHorario(element);
                } catch (error) {
                    this.handleError(error);
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async postHorario(object: HorarioTransferObject): Promise<Number>{
        try{
            return await(await this.BloqueHorarioService.postHorario(object).toPromise()).id;
        }catch(error){
            this.handleError(error);
        }
    }

    async updateTotalHoras(id: Number): Promise<Number>{
        try{
            const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(id).toPromise();
            let totalHorasTemp: number = 0;
            for(const itm of result){
                if(moment(itm.horaFinal).hours() > moment(itm.horaInicio).hours()){
                    totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
                }else{
                    totalHorasTemp+= (moment(itm.horaFinal).hours()+24) - moment(itm.horaInicio).hours();
                }
            }
            
            return totalHorasTemp;
        }catch(error){
            this.handleError(error);
        }
    }

    async putHorario(object: HorarioTransferObject,id: Number): Promise<void>{
        try{
            console.log(await this.BloqueHorarioService.putHorario(id,object).toPromise());
        }catch(error){
            this.handleError(error);
        }
    }

    updateTableData(TableDataView: TableViewModel[],selectedIdBloqueHorario: Number,selectedDataTableViewIndex :Number,selectedHorariosViewIndex: Number,selectedTotalHorasIndex: Number,InitialHour: String,FinalHour: String,IdHorario: Number,DisableHourList: Number[]): any{

        DisableHourList.push(moment(InitialHour.toString()).hours());
        DisableHourList.push(moment(FinalHour.toString()).hours());
        const horarioString = moment(InitialHour.toString()).format('HH')+ ' a ' + moment(FinalHour.toString()).format('HH');
        TableDataView[selectedDataTableViewIndex.valueOf()].IdBloques.push(selectedIdBloqueHorario.valueOf());
        TableDataView[selectedDataTableViewIndex.valueOf()]
        .Tiempo
        .HorarioString[selectedHorariosViewIndex.valueOf()]+=horarioString+'\n';
        
        const valueTotalHoras = TableDataView[selectedDataTableViewIndex.valueOf()].Tiempo.TotalHoras[selectedTotalHorasIndex.valueOf()].valueOf();
        let actualValue: number = 0;
        
        if(moment(FinalHour.toString()).hours() >  moment(InitialHour.toString()).hours()){
            actualValue = moment(FinalHour.toString()).diff(moment(InitialHour.toString()),'hours');
        }else{
            actualValue = (moment(FinalHour.toString()).hours() + 24) - moment(InitialHour.toString()).hours();
        }

        TableDataView[selectedDataTableViewIndex.valueOf()]
        .Tiempo
        .TotalHoras[selectedTotalHorasIndex.valueOf()] = valueTotalHoras + actualValue

        TableDataView[selectedDataTableViewIndex.valueOf()]
        .Tiempo
        .Horarios[selectedHorariosViewIndex.valueOf()].push({Id:IdHorario,Horario:horarioString});

        return {TDV: TableDataView, DHL: DisableHourList};
    }

    
    async updateMatrizHorariaDescripcion(id: Number,object: MatrizHorariaTransferObject): Promise<void>{
        try{
            await this.BloqueHorarioService.putMatrizHoraria(id,object).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }
    
    async deleteHorarios(data: TableViewModel,selectedHorarios: Number[]): Promise<any>{
        let DisbleHoursList: Number[] = [];
        for(const id of selectedHorarios){
            await this.BloqueHorarioService.deleteHorario(id,{estado:false}).toPromise()
        }
        let returnObject: TableViewModel={
            IdBloques: data.IdBloques,
            ClaseDia: data.ClaseDia,
            Tiempo:{
                TotalHoras:[],
                HorarioString:[],
                Horarios:[]
            }
        };
        for(const item of data.IdBloques){
            try{
                const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                let totalHorasTemp: number = 0;
                let horarioStringTemp: String = '';
                let horarioActual: String;
                let tempHorarioObject:Array<{Horario:String,Id:Number}> = [];
                for(const itm of result){
                    DisbleHoursList.push(moment(itm.horaInicio).hours());
                    DisbleHoursList.push(moment(itm.horaFinal).hours());
                    horarioActual = moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH');
                    totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
                    horarioStringTemp+= horarioActual + '\n';
                    tempHorarioObject.push({Id:itm.id,Horario:horarioActual});
                }

                returnObject.Tiempo.Horarios.push(tempHorarioObject);
                returnObject.Tiempo.HorarioString.push(horarioStringTemp);
                returnObject.Tiempo.TotalHoras.push(totalHorasTemp);
            }catch(error){
                this.handleError(error);
            }
        }

        return {TDV: returnObject, DHL: DisbleHoursList};
    }

    async deleteMatrizHoraria(id: Number): Promise<void>{
        try{
            await this.BloqueHorarioService.deleteMatrizHoraria(id,{estado:false}).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }

    // Utitlity Functions -------------------------------
    handleHoursOverflow(object: TableViewModel,InitialHour: Number, FinalHour: Number): Boolean{
        const totalHorasActual = _.sum(object.Tiempo.TotalHoras);
        const totalHorasLocal = (FinalHour > InitialHour)? 
            (FinalHour.valueOf() - InitialHour.valueOf()):
            ((FinalHour.valueOf()+24) - InitialHour.valueOf())
        if((totalHorasActual+totalHorasLocal)>24){
            return true;
        }else{
            return false;
        }
    }

    handleMessage(message: String):void{
        this.AlertService.success(message.toString());
    }

    handleMessageError(message: String):void{
        this.AlertService.error(message.toString());
    }

    handleError(error:any){
        console.error(error);
        this.AlertService.error(`Ha ocurrido un error Inesperado, Codigo:${error.status}`)
    }

    parseString(delimiter: String, input: String): Array<string>{
        const parseString = _.split(input,delimiter);
        const cleanArray = _.compact(parseString);
        return cleanArray;
    }

    arrayToString(array: Array<String>): string{
        let returnString: string = ''
        for(const element of array){
            returnString+=element+'\n';
        }
        return returnString;
    }

    searchStringfromId(object: Array<{Horario: String,Id: Number}>,id: Number): {index: Number, Horario: String}{
        const horario = _.find(object,(itm)=> itm.Id === id ).Horario;
        const index = _.findIndex(object,(itm)=> itm.Id === id);
        return {index: index,Horario:horario}
    }

    parseHorarioString(delimiter: String,input: String): Array<Number>{
        const parseString = _.split(input,delimiter);
        const convertedArray = _.map(parseString,(itm)=> Number(itm));
        return convertedArray;
    }
    
    returnIndexDisableHours(object: Array<Number>,id: Number){
        return _.findIndex(object,(itm)=> itm === id)
    }

    returnIndexMatrizHorariaData(object: MatrizHorariaModel[],id: Number): number {
        return _.findIndex(object, (itm)=> itm.id === id);
    }
    //---------------------------------------------------
}