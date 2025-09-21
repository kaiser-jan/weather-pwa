# ⛅ Weather PWA

[Progressive Web App](https://web.dev/learn/pwa/progressive-web-apps/) providing a good idea of forecasted weather at a glance, while allowing to fully explore the depths of the provided data. All that while giving you full control over what data to use and how to display it.

Currently mobile-only, desktop support is planned.

## Features

- Interactive and beautiful charts (daily and long-term outlook)
- Logically structured overview with full customizability
- Presenting weather data in a way that makes sense to humans, not machines
- Independent of data sources making room for local providers (e.g. from national institutions)
- Comprehensive settings

## Roadmap

- [ ] Outlook View (with daily averages)
- [ ] Desktop Support
- [ ] PWA Install Instructions
- [ ] Warnings (e.g. high temperature, high wind, thunderstorms)
- [ ] Weather Maps
- [ ] Stylistic weather simulation for current section
- [ ] Setup Wizard with suggestions for different layouts

## Known Issues

##### Altitude missing for searched locations

For some calculations, like converting between sea-level and surface pressure, or even some APIs to a certain extent (met.no) an altitude value is necessary. While geolocation usually provides this, the [nominatim search](https://nominatim.org/release-docs/latest/api/Search/) does not.
An elevation API, like [from open-meteo](https://open-meteo.com/en/docs/elevation-api) could help with this.

## Development

As this project is just a web app without a server, setting up the development environment is trivial:

First, let us know in an issue, that you would like to contribute. Use an existing issue if one exists, or create a new one otherwise.
This way, we can ensure no one else is working on the same task and that your contribution will be as helpful as possible.

Next, [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) and clone [this repository](https://github.com/kaiser-jan/weather-pwa).

Then you can install and run the project:

```bash
bun install
bun run setup:dev
bun run dev
```

Please note, that for some features (like geolocation), browsers require the site to be served via https.

## Related Projects

- [open-meteo](https://open-meteo.com/): An open-source weather API utilizing open-data weather forecasts from national weather services to provide data from combined sources.

## Attribution & Credits

- [Nominatim](https://nominatim.org) for reverse geocoding and place search
- Data Providers: All providers can be found in `src/lib/data/providers`. Providers used for the displayed forecast are listed in the app under the `Data Sources` section.

---

# Writeup

## Motivation and Goals

There is an abundance of weather apps out there, yet none of those seems to fit my needs:

- Easily digestible overview, while allowing to dive deep into the details
- Visualizing data in a way that makes sense to **me**
- Clean and modern look
- Accurate weather data from local providers
- Comparing multiple metrics in one chart

Visualizing data simply fascinates me. And weather data offers an interesting challenge, as it is relatable, offers loads of datapoints and has various common ways of visualization to challenge. Therefore, I set out to explore other ways of displaying this well-known type of data (spoiler: in many cases, common forms of visualizing have a reason).

## Laying out the data

Weather forecasts at a given location have two dimensions: there is a list of parameters with a predicted values at given timestamps.
(For now, I have not tackled exploring the next dimension, the spatial one.)

Generally, weather overviews are laid out by time first. Also, it makes sense to sort by decreasing detail, starting with the current moment and going towards longer timespans with less detail.

### Current Weather

The current weather is usually the most prominent. Right there at the top, large enough to be easy to read at a glance.
It keeps the current moment present and serves as a reference for comparing to what's coming.
Still, I chose to keep the current section smaller than some other apps (e.g. Samsung's One UI weather app, or the default weather app on iOS), so the forecasts are still visible without having to scroll.
Another common pattern is styling this section in a way that reflects the current weather situation. I would love going into more detail with this (reacting to rain, snow, wind etc., maybe even having a tiny world reflecting weather and season), but this would be a project of itself...

### Short-Term

Nearly all weather apps have an hourly forecast starting now and extending around 60 hours into the future (e.g. Google Weather or the previously mentioned ones).
This is an easy choice, as most APIs provide short term data in this format and do not provide historic data.

But for me personally, I love having some data from the past to compare to. It serves as a reference to what I have felt and makes forecasted data more tangible. Even if this means additional work and maybe even an extra API call. Of course, starting at the current time is also available as an option.

Another deliberate difference is opting for a full-day chart over a list of hourly values. I just can't get around choosing the latter approach, as this means having text for the time which could just be told by the x-axis of the chart. The only advantage I can think of is having e.g. the temperature as a number value - but I think [my effort on perfecting charts](#charts-my-beloved) mostly solves this.

### Long-Term Outlook

The outlook, as I am calling it, aims to convey the current trend. Is it getting warmer or colder? Will the good/bad weather only last for a day or is it here to stay? It also gives a short summary of each day and serves as an entrypoint into exploring days in more detail.

## Exploring different forms of visualization

### Charts, my beloved

No matter what we try, nothing even comes close to charts when trying to visualize data in detail, whilst keeping the overall picture.
But there are many decisions which can make or break a chart:

##### The chart type

Forecasts require a time axis. Still, we don't have to display data as a line, for some metrics bars (precipitation) or areas (cloud coverage, min/max ranges) better convey what they express.
And while most metrics are displayed as lines, the foundation is laid to choose other representations by changing one line of code.

##### Colors

The axes need to be clearly readable, but should not distract from the data. Different data series need to be easily distinguishable.

But besides that, color can even be used to support readability of data. A great example for this is temperature. Having defined colors for specific temperatures allows estimating the temperature quite precisely, without looking at the axis. This theme can be carried across the app to support temperature values, even when presented as numbers.
One problem of this approach could be how different humans perceive temperature - do the chosen colors make sense for someone living in an area with different temperature ranges and averages?
Color for emphasizing value can be used for many other metrics as well, like UVI, Air Quality or Precipitation.

Working hard on fulfilling those requirements has led to beautiful and easy-to-read charts, which even allow displaying multiple parameters at once.

##### Axes

A proper chart needs axes, people say. Usually, I agree with that. But in the end I found that when form and color are carefully chosen to support the data representation, axes can be hidden - at least for the overview. Percentage values (cloud coverage, humidity) always use the scale 0%-100%. Metrics with supportive color gradients (temperature, precipitation, air quality) should use color to convey the value.
This leaves only a few metrics, one of them being wind speed. That's a tough one, as many people (myself included) do not really have a feeling for wind speeds. For now, the domain is large enough to cover most cases, so at least low/medium/high winds can be well differentiated. In the future, adding categorizing words or even adapting the beaufort wind scale could help.
No matter what, users can always choose to always display axes.

## Being independent of data sources - The Good, the Bad and the Ugly

The desired independence of data sources offers some great benefits - but it also presents various challenges for implementation.

### The Good

Being independent of the source of our data greatly reduces the impact of decisions made by the providers. If a provider chooses to remove the free API or has server outages, it is trivial to source the data from elsewhere (fully switching sources when one is offline is yet to be implemented).
Furthermore, it allows users to choose the sources they trust most. Even choosing different sources at different locations would be easily possible. The hard part is getting it right, so it works well out of the box as well - everything else is ready.

The system is flexible enough to combine data from different sources. Data is merged according to the customizable dataset list, with items of shorter duration taking precedence, as those usually stem from forecasts with higher temporal resolution.

### The Bad

Achieving said goals requires not only logic, but also a very flexible data structure.
Most APIs for weather forecasts use one of two formats:

- A `timestamps` array and for each parameter an array of values at those timestamps (e.g. geosphere.at)
- A list of timeperiods with defined start datetime, duration and the values for all parameters at this datetime, or in this period (e.g. met.no)

Neither of these is feasible for holding data combined from multiple sources, with different temporal resolutions - even differing at the same time between parameters.
Therefore, a less space- and memory-efficient format had to be used: Having a list of timebuckets for each parameter, which all have a defined start unix-timestamp, duration (in milliseconds) and value.
Timestamp and duration are in milliseconds, as using js `Date` or even luxon `DateTime` would have a noticable performance impact for processing.

```ts
Record<
  ForecastParameter,
  {
    timestamp: number
    duration: number
    value: number
  }
>
```

### The Ugly

#### What data should we use?

Having many sources, each with different timespans, temporal resolutions, coverage area, provided parameters, etc., etc. requires a good system for automatically choosing datasets to build a fully fledged but localized forecast. All that while leaving users the freedom to prioritize datasets, remove others or fully override the suggested list.

This was achieved by:

1. Noting down the capabilities of each dataset (forecast length, temporal resolution, coverage area, provided parameters, etc.)
2. Filtering datasets which are available at the requested location
3. Defining a list of requirements for a complete forecast. This list is in a config format so it could be customized by the user in the future, to automatically build the perfect forecast for them.
4. Finding datasets (or loaders rather, as I [will cover later](#datasets-loaders-providers)) which to cover as many of the criteria as possible. A dataset may cover multiple criteria.

The list of requirements could look like so:

```ts
// a short-term forecast with high temporal resolution
{ interval: { lt: Duration.fromObject({ hours: 1 }) } },
// a medium-term forecast with less than 3 hours temporal resolutions and multiple days length
{ interval: { lt: Duration.fromObject({ hours: 6 }) }, timespan: { gt: Duration.fromObject({ days: 1 }) } },
// a long-term forecast
{ timespan: { gte: Duration.fromObject({ days: 5 }) } },
// historic data for a few passed hours
{ offset: { gte: Duration.fromObject({ hours: 6 }) } },
```

A possible improvement would be ranking datasets by the distance to the center of the coverage area, so more local forecasts are prioritized.
Currently they are ranked by a user-definable order.

#### Datasets, Loaders, Providers

This challenge is one that I definitively did not account for:
While some providers have an API for each dataset (e.g. geosphere.at) others have an API returning data from multiple datasets - and might even use different datasets dependent on the location. While this is great when building a weather app specifically for this API, it presents a hurdle for the flexibility we aim to achieve.
And even after all this time and work, I have not found a system which can fully handle these differences. But I have created one which does the job for now:
**Dataset**: Data predicted by one forecast model, with consistent temporal resolution and a defined coverage area. Between locations, only the provided parameters may change (this is currently not reflected in the metadata).
**Loader**: A function, usually utilizing an API, to retrieve data. This data may consist of multiple datasets. While we can not disassemble to the individual datasets, we can account for this when choosing the loaders to use.
**Provider**: An organization providing the loaders, and with that, the datasets. This construct is not relevant for retrieving or handling data, only for informing users.
