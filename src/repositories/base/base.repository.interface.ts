import { Model, Document } from "mongoose";
import { SearchCriteria } from "../../models/";

export interface IBaseRepository<IModel extends Document> {
    
    createFromBody(body: object): IModel;
    getCollectionName(): string;

    single(id: string, populationArgument?: any): Promise<IModel>;

    list(searchCriteria: SearchCriteria, populationArgument?: any): Promise<IModel[]>;

    blank();

    count(searchCriteria: SearchCriteria, ): Promise<number>;

    create(model: IModel): Promise<IModel>;

    update(id:string, body: any): Promise<IModel>;

    destroy(id:string): Promise<IModel>;

    clear(searchBody: any): Promise<void>;

    query(searchBody: any, populationArgument: any): Promise<IModel[]>;
}