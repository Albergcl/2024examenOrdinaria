import { Collection, ObjectId } from "mongodb";
import { RestaurantModel, APITime, APIPhone, APIWeather } from "./types.ts";
import { GraphQLError } from "graphql";

type Context = {
    RestaurantCollection: Collection<RestaurantModel>
}

type getRestaurantsArgs = {
    country: string
}

type getRestaurantArgs = {
    id: string
}

type deleteRestaurantArgs = {
    id: string
}

type addRestaurantArgs = {
    name: string,
    address: string,
    location: string,
    phone: string
}

export const resolvers = {
    Restaurant: {
        id: (parent: RestaurantModel) => {
            return parent._id!.toString();
        },

        time: async (parent: RestaurantModel): Promise<string> => {
            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new GraphQLError("Necesitas la Api ninja API KEY");

            const timezone = parent.timezone;
            const url = `https://api.api-ninjas.com/v1/worldtime?timezone=${timezone}`;

            const data = await fetch(url,
                {
                    headers: {
                        "X-Api-Key": API_KEY
                    }
                }
            );
            if(data.status !== 200) throw new GraphQLError("API NINJA ERROR");

            const response: APITime = await data.json();
            return response.datetime;
        },

        temp: async (parent: RestaurantModel): Promise<number> => {
            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new GraphQLError("Necesitas la Api ninja API KEY");

            const location = parent.location;
            const url = `https://api.api-ninjas.com/v1/weather?city=${location}`;

            const data = await fetch(url,
                {
                    headers: {
                        "X-Api-Key": API_KEY
                    }
                }
            );
            if(data.status !== 200) throw new GraphQLError("API NINJA ERROR");

            const responseTemp: APIWeather = await data.json();
            return responseTemp.temp;
        }
    },

    Query: {
        getRestaurants: async (_: unknown, args: getRestaurantsArgs, ctx: Context): Promise<RestaurantModel[]> => {
            const restaurants = await ctx.RestaurantCollection.find({ country: args.country }).toArray();
            return restaurants;
        },

        getRestaurant: async (_: unknown, args: getRestaurantArgs, ctx: Context): Promise<RestaurantModel | null> => {
            const restaurant = await ctx.RestaurantCollection.findOne({ _id: new ObjectId(args.id) });
            return restaurant;
        }
    },

    Mutation: {
        deleteRestaurant: async (_: unknown, args: deleteRestaurantArgs, ctx: Context): Promise<boolean> => {
            const { deletedCount } = await ctx.RestaurantCollection.deleteOne({ _id: new ObjectId(args.id) });
            return deletedCount === 1;
        },

        addRestaurant: async (_: unknown, args: addRestaurantArgs, ctx: Context): Promise<RestaurantModel> => {
            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new GraphQLError("Necesitas la Api ninja API KEY");

            const { name, address, location, phone } = args;
            const phoneExists = await ctx.RestaurantCollection.countDocuments({ phone });
            if(phoneExists >= 1) throw new GraphQLError("El telefono ya existe");

            const urlPhone = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`;

            const dataPhone = await fetch(urlPhone,
                {
                    headers: {
                        "X-Api-Key": API_KEY
                    }
                }
            );
            if(dataPhone.status !== 200) throw new GraphQLError("API NINJA ERROR");

            const responsePhone: APIPhone = await dataPhone.json();
            if(!responsePhone.is_valid) throw new GraphQLError("Formato del telefono invalido");
            const timezone = responsePhone.timezone[0];
            const country = responsePhone.country;

            const urlTemp = `https://api.api-ninjas.com/v1/weather?city=${location}`;

            const dataTemp = await fetch(urlTemp,
                {
                    headers: {
                        "X-Api-Key": API_KEY
                    }
                }
            );
            if(dataTemp.status !== 200) throw new GraphQLError("API NINJA ERROR");

            const responseTemp: APIWeather = await dataTemp.json();
            const temp = responseTemp.temp;

            const { insertedId } = await ctx.RestaurantCollection.insertOne({
              name,
              country,
              location,
              address,
              phone,
              timezone,
              temp
            })

            return {
                _id: insertedId,
                name,
                country,
                location,
                address,
                phone,
                timezone,
                temp
            };
        }
    }
}