import { Allow } from "class-validator";

export class ConfirmReqDto {
    @Allow()
    code: string;
}
