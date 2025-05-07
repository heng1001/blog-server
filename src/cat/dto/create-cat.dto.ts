import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateCatDto {
  @IsString()
  readonly name: string;

  @IsInt()
  @Min(0)
  @Max(20)
  readonly age: number;

  @IsString()
  readonly breed: string;
}
