import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Book } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schmeas/user.schema';

@Injectable()
export class BookService {
    constructor(@InjectModel(Book.name) private bookModel = Model<Book>) { }

    async findAll(query: Query): Promise<Book[]> {
        const resPerPage = 2;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        const keyword = query.keyword
            ? {
                title: {
                    $regex: query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const books = await this.bookModel.find({ ...keyword }).limit(resPerPage).skip(skip);
        return books;
    }

    async create(book: Book, user:User): Promise<Book> {
        const data=Object.assign(book,{user:user._id})
        const res = this.bookModel.create(data);
        return res;
    }

    async findByID(id: string): Promise<Book> {
        const isValidId = mongoose.isValidObjectId(id);
        if (!isValidId) {
            throw new BadRequestException('Enter Correct Id');
        }
        const book = await this.bookModel.findById(id);
        if (!book) {
            throw new NotFoundException('Book not found')
        }
        return book;
    }

    async updateByID(id: string, book: Book): Promise<Book> {
        return await this.bookModel.findByIdAndUpdate(id, book, {
            new: true,
            runValidators: true
        });
    }

    async deleteByID(id: string): Promise<Book> {
        return await this.bookModel.findByIdAndDelete(id);
    }
}
