import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "./schemas/user.schema";
import { AddUserReqDto, AddUserResDto } from "./dto/add-user.dto";

@Injectable()
export class AppService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name)
        private readonly userDocument: Model<UserDocument>
    ) {}

    async add(addUserReqDto: AddUserReqDto) {
        const createUser = new this.userDocument({
            _id: addUserReqDto._id,
            email: addUserReqDto.email,
            first_name: addUserReqDto.firstName,
            last_name: addUserReqDto.lastName,
        });

        createUser.save();
    }

    findOne(value: string, by: string = "_id"): Promise<User> {
        return this.userDocument.findOne({ [by]: value }).exec();
    }
}
