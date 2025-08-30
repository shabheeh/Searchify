import { CreateArtistDTO, IArtist } from "@/types/Artist";

export interface IArtistRepository {
    create(artistData: CreateArtistDTO): Promise<IArtist>;
    bulkCreate(artists: CreateArtistDTO[]): Promise<IArtist[]>;
    getStats(): Promise<number>;
    findById(id: string): Promise<IArtist | null>;
    count(): Promise<number>;
    findAll(): Promise<IArtist[]>;
}