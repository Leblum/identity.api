
import { Model, Document } from "mongoose";
import { SearchCriteria, IBaseModel } from "../../models/index";
import { IBaseRepository } from "./base.repository.interface";

export abstract class BaseRepository<IModel extends Document> implements IBaseRepository<IModel>{

    protected abstract mongooseModelInstance: Model<IModel>;

    public createFromBody(body: object): IModel{
        return new this.mongooseModelInstance(body);
    }

    public getCollectionName(): string{
        return this.mongooseModelInstance.collection.name
    }

    public async single(id: string, populationArgument?: any): Promise<IModel> {
        let query = this.mongooseModelInstance.findById(id);
        query = populationArgument ? query.populate(populationArgument) : query;
        return await query;
    }

    public async list(searchCriteria: SearchCriteria, populationArgument?: any): Promise<IModel[]> {
        let query = this.mongooseModelInstance.find()
            .skip(searchCriteria.skip)
            .limit(searchCriteria.limit)
            .sort(searchCriteria.sort);

        query = populationArgument ? query.populate(populationArgument) : query;

        return await query;
    }

    public blank() {
        return new this.mongooseModelInstance();
    }

    public async count(searchCriteria: SearchCriteria, ): Promise<number> {
        return await this.mongooseModelInstance
            .find(searchCriteria.criteria)
            .count();
    }

    public async create(model: IModel): Promise<IModel> {
        return await model.save();
    }

    public async update(id:string, body: any): Promise<IModel>{
        return await this.mongooseModelInstance.findByIdAndUpdate(id, body, { new: true });
    }

    public async destroy(id:string): Promise<IModel>{
        return await this.mongooseModelInstance.findByIdAndRemove(id);
    }

    public async clear(searchBody: any): Promise<void>{
        return await this.mongooseModelInstance.remove(searchBody);
    }

    public async query(searchBody: any, populationArgument: any): Promise<IModel[]>{
        this.recursivlyConvertRegexes(searchBody);

        let query = this.mongooseModelInstance.find(searchBody);
        query = populationArgument ? query.populate(populationArgument) : query;
        return await query;
    }

    public recursivlyConvertRegexes(requestBody: any) {
    if (requestBody instanceof Array) {
      for (var i = 0; i < requestBody.length; ++i) {
        this.recursivlyConvertRegexes(requestBody[i])
      }
    }
    let keysArray = Object.keys(requestBody);
    for (var index = 0; index < keysArray.length; index++) {
      var currentKey = keysArray[index];
      var element = requestBody[currentKey];
      if ((element instanceof Object || element instanceof Array) && Object.keys(element).length > 0) {
        this.recursivlyConvertRegexes(element);
      }
      else {
        if (currentKey === '$regex') {
          requestBody[currentKey] = new RegExp(requestBody[currentKey], 'i');
          return;
        }
      }
    }
  }
}