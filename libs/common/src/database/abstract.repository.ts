import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';

@Injectable()
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createdDocument.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn(
        'Document was not found with filter query: ',
        filterQuery,
      );
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async updateOne(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const updatedDocument = await this.model
      .updateOne(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);

    if (!updatedDocument) {
      this.logger.warn(
        'Document was not found or updated with query: ',
        filterQuery,
      );
      throw new NotFoundException(
        'Document was not found or could not be updated',
      );
    }

    return updatedDocument;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    const documents = await this.model
      .find(filterQuery)
      .lean<TDocument[]>(true);

    if (!documents) {
      this.logger.warn(
        'Documents were not found with filter query: ',
        filterQuery,
      );
      throw new NotFoundException('Documents were not found');
    }

    return documents;
  }

  async deleteOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    return await this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }
}
