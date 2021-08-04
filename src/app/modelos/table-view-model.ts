export interface TableViewModel{
    IdBloques?: number[],
    ClaseDia?: String | null,
    Tiempo?:{
        TotalHoras: number[],
        Horarios?: Array<{
            Horario: String,
            Id: Number
        }>[]
        HorarioString?: String[]
    }
};