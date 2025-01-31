import { OptionalId } from 'mongodb';

export type RestaurantModel = OptionalId<{
    name: string,
    address: string,
    country: string,
    location: string,
    phone: string,
    timezone: string,
    temp: number
}>

export type APIPhone = {
    is_valid: boolean,
    country: string,
    location: string,
    timezone: string[]
}

export type APIWeather = {
    temp: number
}

export type APITime = {
    datetime: string
}