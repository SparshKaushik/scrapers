let cities: {
  id: number;
  city_name: string;
  group_id: string;
}[] = [];
let serviceIntervals: {
  id: number;
  description: string;
  interval_id: string;
}[] = [];
let params: {
  model: string;
  fuelTypes: string[];
}[] = [];

await fetch(
  "https://api.hyundai.co.in/service/service-calculator/getCity?loc=IN&lan=en",
  {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.hyundai.com",
      Referer: "https://www.hyundai.com/",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
  }
)
  .then((res) => res.json())
  .then((data) => {
    data.map((city: { id: number; city_name: string; group_id: string }) => {
      cities.push(city);
    });
  });
console.log(cities);

await fetch(
  "https://api.hyundai.co.in/service/service-calculator/pms/getInterval?loc=IN&lan=en",
  {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.hyundai.com",
      Referer: "https://www.hyundai.com/",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
  }
)
  .then((res) => res.json())
  .then((data) => {
    data.map(
      (interval: { id: number; description: string; interval_id: string }) => {
        serviceIntervals.push(interval);
      }
    );
  });

await fetch(
  "https://api.hyundai.co.in/service/service-calculator/getModels?loc=IN&lan=en",
  {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.hyundai.com",
      Referer: "https://www.hyundai.com/",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
  }
)
  .then((res) => res.json())
  .then((data) => {
    data.map((model: { model: string }) => {
      params.push({
        model: model.model,
        fuelTypes: [],
      });
    });
  });

await Promise.all(
  params.map(async (param) => {
    return new Promise<void>((resolve, reject) => {
      fetch(
        `https://api.hyundai.co.in/service/service-calculator/getFuelType/${encodeURI(
          param.model
        )}?loc=IN&lan=en`,
        {
          headers: {
            "Content-Type": "application/json",
            Origin: "https://www.hyundai.com",
            Referer: "https://www.hyundai.com/",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          data.map((fuelType: { fuel_type: string }) => {
            param.fuelTypes.push(fuelType.fuel_type);
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  })
);

let data: {
  model: string;
  fuelType: string;
  serviceInterval: string;
  "Air cleaner filter": string;
  "Engine oil": string;
  "Engine oil filter": string;
  "Climate control air filter": string;
  "Fuel filter": string;
  "Engine coolant": string;
  "Spark Plugs": string;
  "Brake Oil": string;
  "Manual Transmission": string;
}[] = [];

function generateCombinations() {
  let combinations: {
    model: string;
    fuelType: string;
    city: string;
    serviceInterval: string;
  }[] = [];

  params.forEach((param) => {
    cities.forEach((city) => {
      serviceIntervals.forEach((interval) => {
        param.fuelTypes.forEach((fuelType) => {
          combinations.push({
            model: param.model,
            fuelType: fuelType,
            city: city.city_name,
            serviceInterval: interval.interval_id,
          });
        });
      });
    });
  });

  return combinations;
}

const combinations = generateCombinations();
console.log(combinations.length);
await Promise.all(
  combinations.map(async (combination) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.hyundai.co.in/service/service-calculator/pms/calculate?interval=${encodeURI(
              combination.serviceInterval
            )}&model=${encodeURI(combination.model)}&fuel_type=${encodeURI(
              combination.fuelType
            )}&groupId=${encodeURI(
              cities.find((city) => city.city_name === combination.city)
                ?.group_id ?? ""
            )}`,
            {
              headers: {
                "Content-Type": "application/json",
                Origin: "https://www.hyundai.com",
                Referer: "https://www.hyundai.com/",
                "User-Agent":
                  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
              },
              method: "POST",
            }
          );
          const resData = await res.json();
          data.push({
            model: combination.model,
            fuelType: combination.fuelType,
            serviceInterval: combination.serviceInterval,
            "Air cleaner filter":
              resData.data.items.find(
                (item) => item.description === "Air cleaner filter"
              )?.price ?? "",
            "Engine oil":
              resData.data.items.find(
                (item) => item.description === "Engine oil"
              )?.price ?? "",
            "Engine oil filter":
              resData.data.items.find(
                (item) => item.description === "Engine oil filter"
              )?.price ?? "",
            "Climate control air filter":
              resData.data.items.find(
                (item) => item.description === "Climate control air filter"
              )?.price ?? "",
            "Fuel filter":
              resData.data.items.find(
                (item) => item.description === "Fuel filter"
              )?.price ?? "",
            "Engine coolant":
              resData.data.items.find(
                (item) => item.description === "Engine coolant"
              )?.price ?? "",
            "Spark Plugs":
              resData.data.items.find(
                (item) => item.description === "Spark Plugs"
              )?.price ?? "",
            "Brake Oil":
              resData.data.items.find(
                (item) => item.description === "Brake Oil"
              )?.price ?? "",
            "Manual Transmission":
              resData.data.items.find(
                (item) => item.description === "Manual Transmission"
              )?.price ?? "",
          });
          resolve();
        } catch (error) {
          console.log(
            `Model: ${combination.model}, Fuel Type: ${combination.fuelType}, Service Interval: ${combination.serviceInterval}, City: ${combination.city}`
          );
          console.log(
            `https://api.hyundai.co.in/service/service-calculator/pms/calculate?interval=${encodeURI(
              combination.serviceInterval
            )}&model=${encodeURI(combination.model)}&fuel_type=${encodeURI(
              combination.fuelType
            )}&groupId=${encodeURI(
              cities.find((city) => city.city_name === combination.city)
                ?.group_id ?? ""
            )}`
          );
          console.log(data.length);
          reject(error);
        }
      }, 1000); // 1 second delay
    });
  })
);

Bun.write("hyundai-service-calculator/data.json", JSON.stringify(data));
