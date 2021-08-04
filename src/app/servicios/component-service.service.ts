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

    async getInitialData(
            MatrizHorariaData: MatrizHorariaModel[],
            MatrizHorariaKey: Number,
            BloqueHorarioData: any[],
            TableDataView: TableViewModel[]
    ): Promise<any>{
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
                for(const item of element.IdBloques){
                    try{
                        const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                        let totalHorasTemp: number = 0;
                        let horarioStringTemp: String = '';
                        let horarioActual: String;
                        let tempHorarioObject:Array<{Horario:String,Id:Number}> =[];
                        for(const itm of result){
                            horarioActual = moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH');
                            totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
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
            }
            //Retorna Los Valores reales ya que no son argumentos por referencia y se pierde la data al terminar la funcion
            return {
                MHD: MatrizHorariaData,
                MHK: MatrizHorariaKey,
                BHD: BloqueHorarioData,
                TDV: TableDataView
            }
        }catch(error){
            this.handleError(error);
        }
    }

    handleError(error:any){
        console.error(error);
        this.AlertService.error(`Ha ocurrido un error Inesperado, Codigo:${error.status}`)
    }

    async updateBloquesHorarios(
            id: Number,
            BloqueHorarioData: any[],
            TableDataView: TableViewModel[]
    ): Promise<any>{
        try{
            const preDataBloqueHorario = await this.BloqueHorarioService.getBloqueHorario(id).toPromise();
            const groupedData = _.groupBy(preDataBloqueHorario,entity => entity.claseDia.nombre);
            BloqueHorarioData = Object.values(groupedData);
            TableDataView = [];
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
                for(const item of element.IdBloques){
                    try{
                        const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                        let totalHorasTemp: number = 0;
                        let horarioStringTemp: String = '';
                        let horarioActual: String;
                        let tempHorarioObject:Array<{Horario:String,Id:Number}> = [];
                        for(const itm of result){
                            horarioActual = moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH');
                            totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
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
            }

            return {
                BHD: BloqueHorarioData,
                TDV: TableDataView,
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async updateMatrizHoraria(
            MatrizHorariaData: MatrizHorariaModel[],
            MatrizHorariaKey: Number,
            BloqueHorarioData: any[],
            TableDataView: TableViewModel[],
    ): Promise<any>{
        try{
            MatrizHorariaData = await this.BloqueHorarioService.getMatrizHoraria().toPromise();
            const {BHD,TDV} = await this.updateBloquesHorarios(MatrizHorariaKey,BloqueHorarioData,TableDataView);
            return {
                MHD: MatrizHorariaData,
                MHK: MatrizHorariaKey,
                BHD: BHD,
                TDV: TDV
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

    async autoGenerateBloqueHorario(id: Number){
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

    updateTableData(
        TableDataView: TableViewModel[],
        selectedIdBloqueHorario: number,
        selectedDataTableViewIndex :number,
        selectedHorariosViewIndex: number,
        selectedTotalHorasIndex: number,
        InitialHour: string,
        FinalHour: string,
        IdHorario: Number
    ): any{
        const horarioString = moment(InitialHour).format('HH')+ ' a ' + moment(FinalHour).format('HH');
        TableDataView[selectedDataTableViewIndex].IdBloques.push(selectedIdBloqueHorario);
        TableDataView[selectedDataTableViewIndex]
        .Tiempo
        .HorarioString[selectedHorariosViewIndex]+=horarioString+'\n';
        
        TableDataView[selectedDataTableViewIndex]
        .Tiempo
        .TotalHoras[selectedTotalHorasIndex]+= moment(FinalHour).diff(moment(InitialHour),'hours');

        TableDataView[selectedDataTableViewIndex]
        .Tiempo
        .Horarios[selectedHorariosViewIndex].push({Id:IdHorario,Horario:horarioString});

        return TableDataView;
    }

    
    async updateMatrizHorariaDescripcion(id: Number,object: MatrizHorariaTransferObject): Promise<void>{
        try{
            await this.BloqueHorarioService.putMatrizHoraria(id,object).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }
    
    async deleteHorarios(data: TableViewModel,selectedHorarios: Number[]): Promise<TableViewModel>{
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

        return returnObject;
    }

    async deleteMatrizHoraria(id: Number): Promise<void>{
        try{
            await this.BloqueHorarioService.deleteMatrizHoraria(id,{estado:false}).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }

    // Utitlity Functions -------------------------------
    handleMessage(message: String):void{
        this.AlertService.success(message.toString());
    }

    parseString(delimiter: string, input: string): Array<string>{
        const parseString = _.split(input,delimiter);
        const cleanArray = _.compact(parseString);
        return cleanArray;
    }

    arrayToString(array: Array<string>): string{
        let returnString: string = ''
        for(const element of array){
            returnString+=element+'\n';
        }
        return returnString;
    }
    
    returnIndexMatrizHorariaData(object: MatrizHorariaModel[],id: number): number {
        return _.findIndex(object, (itm)=> itm.id === id);
    }
    //---------------------------------------------------
}