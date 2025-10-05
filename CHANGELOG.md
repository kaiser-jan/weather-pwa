## [1.5.3](https://github.com/kaiser-jan/weather-pwa/compare/v1.5.2...v1.5.3) (2025-10-05)


### Bug Fixes

* **cache:** remove unnecessary cache parameters about location origin ([184257e](https://github.com/kaiser-jan/weather-pwa/commit/184257e6105971ff6ac70609097585decb5bc79d))
* **location:** actually suggest saving geolocation only after multi use ([76bcd60](https://github.com/kaiser-jan/weather-pwa/commit/76bcd604b18ff51a07e75554666c9368eab680d0))
* **precipitation:** remove gaps from MiniPrecipitationChart ([fb4ba80](https://github.com/kaiser-jan/weather-pwa/commit/fb4ba8081936e6f06e2014e9d68e138f2106a07e))

## [1.5.2](https://github.com/kaiser-jan/weather-pwa/compare/v1.5.1...v1.5.2) (2025-10-04)


### Bug Fixes

* **deps:** update svelte-settings ([073da94](https://github.com/kaiser-jan/weather-pwa/commit/073da944fe6264e7ca0d5d7e6733ccc478ef8fec))

## [1.5.1](https://github.com/kaiser-jan/weather-pwa/compare/v1.5.0...v1.5.1) (2025-10-04)


### Bug Fixes

* add about and privacy policy link to setup pages as well ([755b910](https://github.com/kaiser-jan/weather-pwa/commit/755b910c0926e815c4cae6cfafc8eaafe3eee805))
* **chart:** inverted setting sections.components.chart.showValueAxes ([21b1c6b](https://github.com/kaiser-jan/weather-pwa/commit/21b1c6bfe9cbb42c12f6825fd1463e3b550444ab))
* **day:** disable navigation to nonexistant days ([a832229](https://github.com/kaiser-jan/weather-pwa/commit/a832229142755655565aac5ee5e99a876c81206b))
* **geosphere.at:** remove unnecessary pressure conversion ([1b18bc8](https://github.com/kaiser-jan/weather-pwa/commit/1b18bc857464e7cdf7137f9ac6798cb3707a5ea5))
* **location:** do not auto-start location service on search open ([34d93d6](https://github.com/kaiser-jan/weather-pwa/commit/34d93d6c7a19d143d122a0082e1c03644bf30873))

# [1.5.0](https://github.com/kaiser-jan/weather-pwa/compare/v1.4.1...v1.5.0) (2025-09-19)


### Bug Fixes

* app extending beyond bottom bar on android ([228b0d0](https://github.com/kaiser-jan/weather-pwa/commit/228b0d0bdae8b726002d049f7d431c491df1ff80))
* **aqi:** section aqi store not reactive causing partially empty section ([2ccf3f9](https://github.com/kaiser-jan/weather-pwa/commit/2ccf3f903ea0d0f075f52571cfddaa721501b466))
* **cache:** properly clear cache by wiping localStorage except settings ([2fc3bd7](https://github.com/kaiser-jan/weather-pwa/commit/2fc3bd79ee3284b7d354b5941a975223c96dc92e))
* **chart:** axis pointer broken on chrome mobile due to touch-action ([4ff0a4f](https://github.com/kaiser-jan/weather-pwa/commit/4ff0a4fd51f638f290ed531340f264ec6e43f301))
* **chart:** disable parameter select if there are no values for it ([2b15d1f](https://github.com/kaiser-jan/weather-pwa/commit/2b15d1fe66f5aaf90ee7fe338f4cbeabe5d95417))
* **chart:** segmented chart color broken after refactor ([3242021](https://github.com/kaiser-jan/weather-pwa/commit/32420211b74674d096125792a4b50a7e3c40f585))
* **chart:** segmented colors shifted by one ([03cfa20](https://github.com/kaiser-jan/weather-pwa/commit/03cfa204f70517f94ccda42163d4ede0401f59bd))
* **chart:** use curveMonotoneX for a more accurate representation ([e1fae05](https://github.com/kaiser-jan/weather-pwa/commit/e1fae05c47e97b79cefbaff34b72b5c4be5b2d8d))
* correct safe area prop check ([9bb4fd1](https://github.com/kaiser-jan/weather-pwa/commit/9bb4fd1280c3dbae21f81a0537a585170ec88ff1))
* **current:** incorrect spacer height including safe area ([4c10be7](https://github.com/kaiser-jan/weather-pwa/commit/4c10be7dde3feb1a62cf85e49700c6f9f0c58cae))
* **data:** omitting incomplete days causing current day to be missing ([4bf6314](https://github.com/kaiser-jan/weather-pwa/commit/4bf6314ddaf2401c96ad6f945d8f30bd704cbdd4))
* **day:** day navigation broken due to unset metrics param ([ef5b1e8](https://github.com/kaiser-jan/weather-pwa/commit/ef5b1e80a95cb2f423683db670e1d900a81daae8))
* **day:** day view crashing due to access on undefined forecastStore ([32fa061](https://github.com/kaiser-jan/weather-pwa/commit/32fa06177a75db8871d478e45727835f57086a66))
* **day:** disable swiping to a nonexistent day ([5e85fa1](https://github.com/kaiser-jan/weather-pwa/commit/5e85fa16827d93ff03324d4697134476516b482e))
* **day:** metrics selection lost when changing days ([3ce8ab3](https://github.com/kaiser-jan/weather-pwa/commit/3ce8ab3416067b1e8d04ef2836fd2eeba02ec243))
* **day:** parameter summary toggles not working due to missing bind ([ad9bed9](https://github.com/kaiser-jan/weather-pwa/commit/ad9bed9370a9563288f29d04bbbd42d46c3ba5cb))
* **derived:** total eaqi colors shifted by one ([7d90b3f](https://github.com/kaiser-jan/weather-pwa/commit/7d90b3f3b40d56bce7d7225657f9c4f8a4e0723f))
* disable pull-to-refresh via css overscroll-behavior ([0e0d8e4](https://github.com/kaiser-jan/weather-pwa/commit/0e0d8e47a82b2882f439f01c8c5158878fa5d1dd))
* **location:** go to main view after saving a location ([0bf0292](https://github.com/kaiser-jan/weather-pwa/commit/0bf029298ad8cbbc5976806a4bd03ff7f67ab28d))
* **location:** make recent searches properly reactive ([5240ab4](https://github.com/kaiser-jan/weather-pwa/commit/5240ab40d558bca47b2ee5066084bc46007c8208))
* **location:** scroll complete content, not just saved locations ([6efff37](https://github.com/kaiser-jan/weather-pwa/commit/6efff375c832c58ff41c8ee324029ff042d9bdb3))
* **notices:** hide title as a workaround for empty section ([e13b196](https://github.com/kaiser-jan/weather-pwa/commit/e13b1968d54d26b39ba89b901469e3993a780851))
* parameter toggle keeping hover state in chrome on samsung ([e250d79](https://github.com/kaiser-jan/weather-pwa/commit/e250d798943839b27947610c5fcca31515e95d93))
* remove text uncolored:boolean from loaderState ([04585aa](https://github.com/kaiser-jan/weather-pwa/commit/04585aa4cb2a347d28f31ca47aa09734346bec3c))


### Features

* basic view transition when navigating away from / ([594b50e](https://github.com/kaiser-jan/weather-pwa/commit/594b50e938dad73c4b921f4a37d7f3c8a300911b))
* **chart:** add option to hide y axes ([c393a5e](https://github.com/kaiser-jan/weather-pwa/commit/c393a5e0d408d5962a3d4a3f2bec6c08faf8be85))
* **chart:** next 24 hours mode ([3e5a3c3](https://github.com/kaiser-jan/weather-pwa/commit/3e5a3c327752074c06a863739a56406f3f0fb1ae))
* **data:** add separate pressure_surface and pressure_sealevel ([e2c3d43](https://github.com/kaiser-jan/weather-pwa/commit/e2c3d439c868c555d75a2f8c2f9c1558daf70cae))
* **day:** move day view from drawer to full page ([1104213](https://github.com/kaiser-jan/weather-pwa/commit/1104213b86afb5d0b61dfcb1b1608b2402826a03))
* **day:** simplify navigation by replacing state when changing day ([fdff26d](https://github.com/kaiser-jan/weather-pwa/commit/fdff26d83f46d6587b2afdc0aa971c79e207e48c))
* **day:** write chart params to url to persist during page reload ([14a15b9](https://github.com/kaiser-jan/weather-pwa/commit/14a15b9fa339b83c9196fc6fbf029f61e779471a))
* **design:** remove background color from containers ([2a47d27](https://github.com/kaiser-jan/weather-pwa/commit/2a47d27553830f2b6d479851f8581250b8c4d195))
* **geolocation:** snap to nearby location if within limit ([5efa1bd](https://github.com/kaiser-jan/weather-pwa/commit/5efa1bd0e575cf156d6770e7e603a779b8321efc))
* **insights:** add mini chart to PrecipitationGroup ([6285489](https://github.com/kaiser-jan/weather-pwa/commit/628548931c3b5c8ae4ad07477c0c6960a58ac1b8))
* **interactions:** change view transitions so pages slide in and out ([1cf2159](https://github.com/kaiser-jan/weather-pwa/commit/1cf2159ab9fe3f118ab8ff63579db69317fac7e0))
* **loaders:** show counts in loader summary label ([7fab1ea](https://github.com/kaiser-jan/weather-pwa/commit/7fab1ea01951a66826f4dce161004e8ac3b7928c))
* **locations:** open setting when long pressing location in bottom bar ([254f187](https://github.com/kaiser-jan/weather-pwa/commit/254f187e038d8dbdf3368718d73d05848ed54138))
* **location:** suggest saving geolocation when used frequently ([4ee38da](https://github.com/kaiser-jan/weather-pwa/commit/4ee38da9babeed3da0d21971f4480e8538b2a615))
* **metrics:** rework color categories with gradient and segments ([af86624](https://github.com/kaiser-jan/weather-pwa/commit/af8662482c0532b35c7c57a208705425c8cd6f24))
* **outlook:** large parameter select like day view in outlook view ([35deea5](https://github.com/kaiser-jan/weather-pwa/commit/35deea5222cbc336fac2acc0b8f1c8871a07bfa2))
* **outlook:** very basic outlook chart ([5470f8c](https://github.com/kaiser-jan/weather-pwa/commit/5470f8cc0cb401444269b58aa7a2b23c5bd80690))
* **precipitation:** color based on categorization ([678e64f](https://github.com/kaiser-jan/weather-pwa/commit/678e64fce15df2fa04b116de10309532ed166c0a))
* **precipitation:** only show remaining amount for groups today ([5340e88](https://github.com/kaiser-jan/weather-pwa/commit/5340e88970834de6fc80abfc07be938f0dac0065))
* **pwa:** change theme colors to transparent ([28f53bf](https://github.com/kaiser-jan/weather-pwa/commit/28f53bf024e4ee3d291464a30bc04c8f0a888b77))
* **sections:** add action to re-run all settings migrations ([703a7bb](https://github.com/kaiser-jan/weather-pwa/commit/703a7bb1e3dec9dc66da636c1a8a58215db9203f))
* **sections:** allow reordering and hiding sections ([48568b2](https://github.com/kaiser-jan/weather-pwa/commit/48568b21e7b7d8cbbe5c399152a4ce09852fa481))
* **sections:** upgrade today section, add tomorrow section ([20e6bcc](https://github.com/kaiser-jan/weather-pwa/commit/20e6bcc53bce309ecd3d847063faf7f532ea4cc3))
* **settings:** add colors for negative temperatures ([96b9353](https://github.com/kaiser-jan/weather-pwa/commit/96b9353140b06c69f060707a7929b90e70789bd9))
* **settings:** add descriptions for most settings ([96b944b](https://github.com/kaiser-jan/weather-pwa/commit/96b944baf0eb9d4aaf0c9eb391147ca7735ceec0))
* **settings:** add version migration logic and current migrations ([e182cfa](https://github.com/kaiser-jan/weather-pwa/commit/e182cfa67f06be96b72fe3707094100594209a39))
* **settings:** better format dataset names ([6950917](https://github.com/kaiser-jan/weather-pwa/commit/6950917edcfbf37a45e7923ea4f8454aec18687a))
* **settings:** convert chart tooltip boolean to select ([a86bad8](https://github.com/kaiser-jan/weather-pwa/commit/a86bad81e23d77c89a9c6b4443941ce7eff88e17))
* **settings:** edit datasets in fullscreen ([b065510](https://github.com/kaiser-jan/weather-pwa/commit/b0655108316cf133f7e4f191a8746ad2d8fe745c))

## [1.4.1](https://github.com/kaiser-jan/weather-pwa/compare/v1.4.0...v1.4.1) (2025-09-02)


### Bug Fixes

* **location:** only show up to three recent searches ([f6f02ed](https://github.com/kaiser-jan/weather-pwa/commit/f6f02ed994d7a10e821f1aa23dd9aac9bf78d012))

# [1.4.0](https://github.com/kaiser-jan/weather-pwa/compare/v1.3.2...v1.4.0) (2025-08-31)


### Bug Fixes

* **build:** correct latest tag ([cc8c412](https://github.com/kaiser-jan/weather-pwa/commit/cc8c412b2fcaf161d5f5c970f0d0a19e4471bb5b))
* **chart:** only show nearest value where there is data ([a2721fb](https://github.com/kaiser-jan/weather-pwa/commit/a2721fb9194be1eda6477781b688cae44a666de5))
* **chart:** past days error due to axis ([e3f872a](https://github.com/kaiser-jan/weather-pwa/commit/e3f872ad97cb70688ff5353c3a4fc571ab8e0023))
* **chart:** right axes not aligned besides the first one ([15512f4](https://github.com/kaiser-jan/weather-pwa/commit/15512f452c4bf6ebe67238fbbf48edc5b57531df))
* **chart:** unify air quality domains ([8de4af0](https://github.com/kaiser-jan/weather-pwa/commit/8de4af0e19579707dc12a641250ef8d869325e2f))
* **day:** better format list of hidden selected metrics ([5ff16f0](https://github.com/kaiser-jan/weather-pwa/commit/5ff16f004f6a15d5fbba05e0638faca0283e81fc))
* **derived:** duplicate timebuckets causing choppy graph ([0637729](https://github.com/kaiser-jan/weather-pwa/commit/06377294cb9a72c5c971469b4a2719342c6116d6))
* **derived:** eaqi one too high ([a580e32](https://github.com/kaiser-jan/weather-pwa/commit/a580e32a2119f2750d457adc1e7733e222dbacf7))
* incorrect day end datetime ([180fa55](https://github.com/kaiser-jan/weather-pwa/commit/180fa55b15f2c15e02ee995a56cd37c0bbc8a646))
* **loaders:** instantly apply final update leading to quicker ui load ([54e20b1](https://github.com/kaiser-jan/weather-pwa/commit/54e20b1ea1f7dab2b35661ce453d345d846f2686))
* **open-meteo:** wind speed conversion ([d39eedd](https://github.com/kaiser-jan/weather-pwa/commit/d39eedddb79f2cd6de3e225e296c03ea78dd552c))
* **outlook:** properly scroll to today by default ([6ce8c91](https://github.com/kaiser-jan/weather-pwa/commit/6ce8c91c71da4988ee526a95a6e3677da0058a4b))
* **settings:** enable datasets setting ([c813ea8](https://github.com/kaiser-jan/weather-pwa/commit/c813ea85265736c3edad751ba8aeb33348fcfc15))
* **settings:** reorder multiselect not updating on reset ([8b2672e](https://github.com/kaiser-jan/weather-pwa/commit/8b2672efc74270fef5ac25f66512edc4de3e5ea8))


### Features

* **chart:** allow reusing existing axis for e.g. dew point ([68fc427](https://github.com/kaiser-jan/weather-pwa/commit/68fc4279e7120d8f8c0d7d5d7fc94ae86a5ca70c))
* **chart:** derive domains for air pollutants from total aqi ([2d78e85](https://github.com/kaiser-jan/weather-pwa/commit/2d78e8571fb465e0e3b7a802a0df0b11d36dc6c4))
* **chart:** hide axis if there are no data points for it ([b592c4c](https://github.com/kaiser-jan/weather-pwa/commit/b592c4c0600c79fa75f41dc962eaba8a7f2cd5e8))
* **chart:** hide hidden metrics in ParameterSelect ([b9489f2](https://github.com/kaiser-jan/weather-pwa/commit/b9489f2329f0e137e33bfda406953f0e8b728cd8))
* **chart:** merge styling of ParameterDaySummary into ParameterSelect ([e525548](https://github.com/kaiser-jan/weather-pwa/commit/e5255489c2e7727f2e9cd8f81f56a90f42742845))
* **chart:** move pinned metrics to settings ([4b5db32](https://github.com/kaiser-jan/weather-pwa/commit/4b5db3228a48b3679c203b980c1c332d6aee814d))
* **chart:** show include parameters in tooltip ([3ce5795](https://github.com/kaiser-jan/weather-pwa/commit/3ce5795f4832281299dfbe866f66f309dfc0bde7))
* **current:** allow choosing displayed metrics ([1c4698e](https://github.com/kaiser-jan/weather-pwa/commit/1c4698ea58082a0840c186a4afe11a0aecbb4260))
* **derived:** add aqi ([b01de56](https://github.com/kaiser-jan/weather-pwa/commit/b01de568a26a1859e393209efa53fc430733ea1b))
* **derived:** add dew point ([82d0f04](https://github.com/kaiser-jan/weather-pwa/commit/82d0f04e814a31947a57dd44c6fba221ffed37f6))
* **location:** show recent searches ([e3acf31](https://github.com/kaiser-jan/weather-pwa/commit/e3acf31752619de13924de030daaa389353f4ea1))
* **providers:** add meteo france via open-meteo ([d140045](https://github.com/kaiser-jan/weather-pwa/commit/d140045c9cf5fac188e846def752228ea2b72cc9))
* **settings:** add reorderable multiselect ([11ee2f0](https://github.com/kaiser-jan/weather-pwa/commit/11ee2f091dd4ef03eea5c7764b9fbdbe8d61add4))
* **settings:** show aqi label by default ([f686adf](https://github.com/kaiser-jan/weather-pwa/commit/f686adf256b4c46c17bd85ec8cf369861402ab2d))
* show loader summary state instead of reload button ([618fde2](https://github.com/kaiser-jan/weather-pwa/commit/618fde2f9d9ba72abc24531014c042351abc0000))
* various minor improvements and fixes ([bef6931](https://github.com/kaiser-jan/weather-pwa/commit/bef6931c1e9eeda6776ff2b9b4251de0601c8940))

## [1.3.2](https://github.com/kaiser-jan/weather-pwa/compare/v1.3.1...v1.3.2) (2025-08-03)


### Bug Fixes

* **ui:** shorter animation duration to make active state visible ([bc3a300](https://github.com/kaiser-jan/weather-pwa/commit/bc3a3003a620969a9aebec726632b0b3763f59f0))

## [1.3.1](https://github.com/kaiser-jan/weather-pwa/compare/v1.3.0...v1.3.1) (2025-08-03)


### Bug Fixes

* **data:** store not refreshing on new data ([2ef523c](https://github.com/kaiser-jan/weather-pwa/commit/2ef523c42538140540c81375868220728c2bc694))
* **geosphere.at:** nowcast incorrect base forecast age ([4b0119c](https://github.com/kaiser-jan/weather-pwa/commit/4b0119ccfc93adcb120f1c0a2cf632303bc092f3))
* **pwa:** keep update notification infinitely ([1e1eeae](https://github.com/kaiser-jan/weather-pwa/commit/1e1eeaee726d3c3c15cb6a27ae5af85c2e4d4dfe))
* **ui:** add active styles to buttons ([74e823e](https://github.com/kaiser-jan/weather-pwa/commit/74e823e32dba0e4f80011fcee10dcf39d576d92d))

# [1.3.0](https://github.com/kaiser-jan/weather-pwa/compare/v1.2.0...v1.3.0) (2025-08-03)


### Bug Fixes

* **chart:** axis pointer not always snapping to nearest value ([5afa13b](https://github.com/kaiser-jan/weather-pwa/commit/5afa13b514f8b31ce6beacf4fea8829600b2ced1))
* **chart:** axis side alternation ignoring hidden axis ([a9ecd6a](https://github.com/kaiser-jan/weather-pwa/commit/a9ecd6a53a2924250e745e3fe6398d493ee008da))
* **chart:** snap axis pointer to nearest previous point ([14b3751](https://github.com/kaiser-jan/weather-pwa/commit/14b3751cfb54f3e0e77c0605013474fa1ce9f71c))
* **data:** respect timezone for day start/end timestamp again ([9cae8c6](https://github.com/kaiser-jan/weather-pwa/commit/9cae8c68f50e025f19b9fdab4386f265d811d16f))
* **data:** reverse dataset order to correctly respect priorities ([4902562](https://github.com/kaiser-jan/weather-pwa/commit/4902562e2be2974e153632a0e8d4f5d84fd1a5bb))
* **day:** make day view navigation more reliable ([e3be264](https://github.com/kaiser-jan/weather-pwa/commit/e3be264b78b33ddbe55b0cfb3dd4ad7cf1305db6))
* **day:** still show metrics even if no value is available ([d35a98f](https://github.com/kaiser-jan/weather-pwa/commit/d35a98f0df845e2f4e2d900068e0361c6fa732ce))
* **insights:** show when precipitationGroup reaches end of data ([8b2836a](https://github.com/kaiser-jan/weather-pwa/commit/8b2836abe3698059c42d4699a1e315df9996dcdc))
* **loaders:** throw on response not ok ([1305230](https://github.com/kaiser-jan/weather-pwa/commit/1305230fe0102eff6d0bfc7e61f6adf02e01f8f1))
* **settings:** groups would open as separate pages ([8d87800](https://github.com/kaiser-jan/weather-pwa/commit/8d878007f4f24e1113bc4d674e3487f8083ed7c9))
* **settings:** navigating into groups broken due to throttle ([4127fd9](https://github.com/kaiser-jan/weather-pwa/commit/4127fd95d346fea57ed95a64756b6bd902661062))
* **settings:** value display item not displaying ([0e503a3](https://github.com/kaiser-jan/weather-pwa/commit/0e503a33b0eb59841a7bae0c9587249470795b25))
* various small fixes ([4cd5c45](https://github.com/kaiser-jan/weather-pwa/commit/4cd5c456e2b4bb676b1f65474b61e93202d7db50))


### Features

* **chart:** add empty placeholder ([2cfa7e3](https://github.com/kaiser-jan/weather-pwa/commit/2cfa7e35257a7fed3fc6ebd0662fc99e3a97297f))
* **chart:** auto alternate side of axis ([920615c](https://github.com/kaiser-jan/weather-pwa/commit/920615c5184eec0b9ef1170377268d0fa2d68965))
* **chart:** merge equal axis ([b042f03](https://github.com/kaiser-jan/weather-pwa/commit/b042f037a6e63ddcec4d8a335284cdee4fc0e51b))
* **day:** make chart metrics depend on context or setting ([8298737](https://github.com/kaiser-jan/weather-pwa/commit/8298737b4929e83932c9ff6bdc5142ed2a312dfe))
* **day:** support hiding metrics in accordion ([e74bba9](https://github.com/kaiser-jan/weather-pwa/commit/e74bba941f3f53b061b16ce1408d6c1d7203266e))
* **error:** add error boundary with resolution instructions ([bd74f94](https://github.com/kaiser-jan/weather-pwa/commit/bd74f948578f7507c242b28add0e84c5777e948d))
* **error:** add fail safe wrappers to sections and views ([acb1dd8](https://github.com/kaiser-jan/weather-pwa/commit/acb1dd88bb6bbe624ac0d7c808c03f457c32e311))
* **geosphere.at:** add support for chem-v2-1h-3km and chem-v2-1h-9km ([b722a58](https://github.com/kaiser-jan/weather-pwa/commit/b722a588b19fa644616df8bf965f864a5bd9c0d0))
* **geosphere.at:** add support for inca historical analysis ([d7f34e6](https://github.com/kaiser-jan/weather-pwa/commit/d7f34e604e0e19414bba137b079706d792745eef))
* **loaders:** better integrated sources section ([da4e560](https://github.com/kaiser-jan/weather-pwa/commit/da4e560844f00c634c955de8a112e8d6f9d0dced))
* **loaders:** do not update forecastStore on cache hit ([d87f7db](https://github.com/kaiser-jan/weather-pwa/commit/d87f7db7f44a82cecbaf2aa1ed3d2b17c75334ab))
* **loaders:** show outdated in sources section ([c77eb3e](https://github.com/kaiser-jan/weather-pwa/commit/c77eb3edf677e87a642e8717ea539e62cf58f29f))
* **loaders:** upgrade status display to table including datetimes ([df5eb37](https://github.com/kaiser-jan/weather-pwa/commit/df5eb3781477213d8f2ca28137f10810a2fea4c3))
* **playground:** leafletjs map to visualize dataset coverageArea ([0667ec1](https://github.com/kaiser-jan/weather-pwa/commit/0667ec1b2316049b73eb80049140963668768943))
* **playground:** show selected location on map ([27e1ab2](https://github.com/kaiser-jan/weather-pwa/commit/27e1ab22975172b07ebabe95981dc8afa30edecc))
* **providers:** auto-select datasets based on location ([e0739e7](https://github.com/kaiser-jan/weather-pwa/commit/e0739e7b18f3788dd95ad86a1f12a14896522dc4))
* **providers:** display data sources with links and loading states ([aa8aec4](https://github.com/kaiser-jan/weather-pwa/commit/aa8aec431b30bdb086dcd5d3b272a0ac865e85f1))
* **sections:** add air pollution section ([0c9d702](https://github.com/kaiser-jan/weather-pwa/commit/0c9d702de485e51d2c93a3114d0c302526ad5dca))
* **sections:** better distinguish days as click targets ([2b7b322](https://github.com/kaiser-jan/weather-pwa/commit/2b7b32248dead13ca20798e3446f80f4eee34cb4))
* **timeline-bar:** only show sun when there is cloud data ([d302dfa](https://github.com/kaiser-jan/weather-pwa/commit/d302dfaddb2a0afa12154613b8fed5ed1e124f1f))
* **ux:** various smaller improvements and fixes ([f7437a8](https://github.com/kaiser-jan/weather-pwa/commit/f7437a830b27d98628cafe7de9927856cffaf88f))


### Performance Improvements

* **data:** use timestamp instead of DateTime everywhere ([8655629](https://github.com/kaiser-jan/weather-pwa/commit/8655629f6602bced005cfae06ee3e724a476f466))
* directly provide current datetime as timestamp ([2ad19e1](https://github.com/kaiser-jan/weather-pwa/commit/2ad19e18aa590963ee86eef4afe866aaff5b6f18))

# [1.2.0](https://github.com/kaiser-jan/weather-pwa/compare/v1.1.0...v1.2.0) (2025-07-27)


### Bug Fixes

* **chart:** make scrubbing reliable by disabling swipe for now ([1b8e5d9](https://github.com/kaiser-jan/weather-pwa/commit/1b8e5d9f78cebd9db38df99852bbd1ecc5469f4c))
* **chart:** parameter select visual state not updating ([90365b6](https://github.com/kaiser-jan/weather-pwa/commit/90365b68895460a12733c6552d9bae8dc0373544))
* **chart:** split storage for chart parameters in day view vs today ([3ddf274](https://github.com/kaiser-jan/weather-pwa/commit/3ddf2746f28d83762fe725269a35a4b8bb6bfb13))
* **data:** transform precipitation amount in period to per hour ([c602449](https://github.com/kaiser-jan/weather-pwa/commit/c60244911ebe34fc2f57a453c70198ba14e47f09))
* **day:** scrolling blocked by swipe gesture handling ([c5df5da](https://github.com/kaiser-jan/weather-pwa/commit/c5df5dabeb333188c3f86f574bbf216ff50a0830))
* **insights:** improve precipitation groups which span multiple days ([ffa7956](https://github.com/kaiser-jan/weather-pwa/commit/ffa79561cd4df18049f9bf8f2f3e6a04097292a7))
* **location:** improve deriving readable address names ([f5102e4](https://github.com/kaiser-jan/weather-pwa/commit/f5102e4911fd69d9392b8cc8f60347407db519e9))
* **location:** make icons reactive ([25357a5](https://github.com/kaiser-jan/weather-pwa/commit/25357a509a2978bbd9d74087b86172f341753f41))
* **location:** show search query when using history forward ([4f9a3e2](https://github.com/kaiser-jan/weather-pwa/commit/4f9a3e2434acc7bbf8dbf168ae13dab0c08c7da6))
* **met.no:** correctly merge MultivariateTimeSeries with overlap ([e2f9894](https://github.com/kaiser-jan/weather-pwa/commit/e2f989450c35f884b49f16632dba0ea525490de8))
* **navigation:** navigation not always updating ui ([9a45e11](https://github.com/kaiser-jan/weather-pwa/commit/9a45e111b2763b0ad9f155bacbb8938249c62372))
* notifications not clickable when drawer is open ([2794acf](https://github.com/kaiser-jan/weather-pwa/commit/2794acfd590d63725c87d6d7cae0461f70382a30))
* **today:** allow scrolling page on chart ([989676c](https://github.com/kaiser-jan/weather-pwa/commit/989676cc0f6744c29756a1f82efa8ca7f107369e))


### Features

* **day:** improve selected parameter visuals ([59a1937](https://github.com/kaiser-jan/weather-pwa/commit/59a19375ee33aff5723e047828693d582978619b))
* **geolocation:** improve geolocation ux after startup ([f80efc8](https://github.com/kaiser-jan/weather-pwa/commit/f80efc8351669b855d6a8dec254d8d3a390d2544))
* **location:** add link to location settings ([6431f81](https://github.com/kaiser-jan/weather-pwa/commit/6431f819a07fe0d8f6358bf09072dad3b9bf7175))
* **location:** instant feedback when searching ([a5c9a30](https://github.com/kaiser-jan/weather-pwa/commit/a5c9a30f9bee97a8565cb331daa546afd29f0058))
* **location:** make saved placeholder clickable ([f64adaf](https://github.com/kaiser-jan/weather-pwa/commit/f64adaf639fdf2addf568e516270158b6f982d19))
* **location:** split search results to separate page ([561e80b](https://github.com/kaiser-jan/weather-pwa/commit/561e80b4576f05da1b009ecf95aefa5803648f4a))
* **location:** sync search query with page history state ([3da8c53](https://github.com/kaiser-jan/weather-pwa/commit/3da8c53cca2fa59ccf33d3a23d210c1d484a786a))
* **nav:** implement shallow routing for drawers ([6c14049](https://github.com/kaiser-jan/weather-pwa/commit/6c1404978fca5f34e0ba5745ac09fd5ed25582f0))

# [1.1.0](https://github.com/kaiser-jan/weather-pwa/compare/v1.0.0...v1.1.0) (2025-07-23)


### Features

* **onboarding:** prompt for location selection ([2445aa8](https://github.com/kaiser-jan/weather-pwa/commit/2445aa808973b3a19669ca3774ae7e2b7aff184c))

# 1.0.0 (2025-07-23)


### Bug Fixes

* **chart:** chart tooltip always visible on safari ([10ff595](https://github.com/kaiser-jan/weather-pwa/commit/10ff595f33a629f7665594288a559f2272c2b303))
* **chart:** ensure values display shows values from the same day ([2e8f69d](https://github.com/kaiser-jan/weather-pwa/commit/2e8f69d01f30fc089bfc98bcc8e1e004d4561619))
* **chart:** perform unit conversion everywhere ([43300a4](https://github.com/kaiser-jan/weather-pwa/commit/43300a420a773c943c2241011d32b01fe2ce08f9))
* **chart:** separate scrolling and moving axis pointer ([eb70819](https://github.com/kaiser-jan/weather-pwa/commit/eb708190ef3faa415697640617a2dbf62e70cdd6))
* **chart:** tooltip and value display show/hide ([330f334](https://github.com/kaiser-jan/weather-pwa/commit/330f3344d2b2befc991df77a3aa9405fd803ea8f))
* **chart:** tooltip clipping into edge on first use ([5b72ee2](https://github.com/kaiser-jan/weather-pwa/commit/5b72ee2648fef574115871071ab05f67211fbe4f))
* **chart:** unit conversion for domain ([dd238f4](https://github.com/kaiser-jan/weather-pwa/commit/dd238f4d20dc492e94c7c5fe0b028a963eb7d917))
* **chart:** various chart related fixes ([309f76d](https://github.com/kaiser-jan/weather-pwa/commit/309f76d62e2ff517a2fa1736501ea0606d32f54a))
* **chart:** x axis range ([5e237e5](https://github.com/kaiser-jan/weather-pwa/commit/5e237e5f9f917fc48c57688558acf4305d6cfc8f))
* conflict due to circular import ([16f7221](https://github.com/kaiser-jan/weather-pwa/commit/16f7221420c020e2e694c643007968ea74fdf065))
* crypto.randomUUID not available over http ([2a896cb](https://github.com/kaiser-jan/weather-pwa/commit/2a896cbea02964591eb60662d6c856dfd4bc4e1d))
* **current:** allow current time bucket for precipitation start datetime ([8f9baf6](https://github.com/kaiser-jan/weather-pwa/commit/8f9baf6ad3934698135b0fcd02e32337a1a7286e))
* **current:** better adapt to smaller screens ([f298499](https://github.com/kaiser-jan/weather-pwa/commit/f298499b8bed42310f8e457fe60341cbf74d749f))
* **current:** correct precipitation start and end datetimes ([7541cbd](https://github.com/kaiser-jan/weather-pwa/commit/7541cbdb09bde88b59e59f0b3f7a38f7e0940836))
* **current:** correctly derive current from hourly ([c45a817](https://github.com/kaiser-jan/weather-pwa/commit/c45a8172d4ec3dd05e35d88d2e87eacec0ecfa7b))
* **data:** accumulated values incorrectly shifted to next timebucket ([2ce9c67](https://github.com/kaiser-jan/weather-pwa/commit/2ce9c67879748b149872dc6f2af00e021479aa28))
* **data:** actually use cached complete forecast ([d6142fa](https://github.com/kaiser-jan/weather-pwa/commit/d6142fafb50216aa17cbc71d754c139846e9136a))
* **data:** cut overlap when splitting multiseries to days ([0a50368](https://github.com/kaiser-jan/weather-pwa/commit/0a503689902f1b0245a4cf3932af92f354ccd0db))
* **data:** parse dummy location as float ([ebef0af](https://github.com/kaiser-jan/weather-pwa/commit/ebef0afe8642d5685e7db89bb13764efcce09827))
* **day:** always show precipitation group start ([ab60875](https://github.com/kaiser-jan/weather-pwa/commit/ab60875da1cd8481d3c852985817b960267fbb33))
* **day:** trend direction not working ([6fa63ca](https://github.com/kaiser-jan/weather-pwa/commit/6fa63ca6aa916d1d1b287f39dd219185302d52e3))
* **geolocation:** no load after startup due to incorrect store access ([56bd666](https://github.com/kaiser-jan/weather-pwa/commit/56bd6665b67eb80d21bb116b178bd5a73e540485))
* **geolocation:** only request when actually in use ([9c2b12a](https://github.com/kaiser-jan/weather-pwa/commit/9c2b12a984247402abadc2dcabfc3c381539f3b0))
* **geosphere.at:** convert surface pressure to sea level ([c87590f](https://github.com/kaiser-jan/weather-pwa/commit/c87590f70d4e133e0a0533e57a1722035e529042))
* **geosphere.at:** correct forecast response validity duration ([313f75b](https://github.com/kaiser-jan/weather-pwa/commit/313f75b019e7f7e35b7a05bc52b64f683294add8))
* **geosphere.at:** hourly accumulated precipitation ([6a0eeea](https://github.com/kaiser-jan/weather-pwa/commit/6a0eeea600d0b32b1f07344d13718751ff9bdde5))
* **geosphere.at:** incorrect precipitation amount calculation ([6c91504](https://github.com/kaiser-jan/weather-pwa/commit/6c91504e909bef7565beb1a078de4bb81253ee21))
* **geosphere.at:** no data if nwp with offset fails ([72b6af4](https://github.com/kaiser-jan/weather-pwa/commit/72b6af4fab601b232b4e404be4e2df2f75b442ea))
* **geosphere.at:** precipitation decumulation breaks with 0 ([f2886d8](https://github.com/kaiser-jan/weather-pwa/commit/f2886d8717d8b1a605969484d9cc4d07de8b764a))
* **geosphere.at:** respect max offset ([05e8a08](https://github.com/kaiser-jan/weather-pwa/commit/05e8a08a645b57cdb457d4f4699b472bc11f98ad))
* **location:** add fallbacks if a location is deleted ([700d0b7](https://github.com/kaiser-jan/weather-pwa/commit/700d0b78db39cb400e28d4dede033c13d98e3328))
* **location:** fix search drawer on iOS ([08e0ed8](https://github.com/kaiser-jan/weather-pwa/commit/08e0ed8f7a4d792ade25d5c1c9a65c83ce7d554f))
* **locations:** use unique id for saved locations ([2f2e3c9](https://github.com/kaiser-jan/weather-pwa/commit/2f2e3c99e88ecf8d1f4e196aff6849fc82b3c9d2))
* **met.no:** allow omitting altitude ([77f8c6d](https://github.com/kaiser-jan/weather-pwa/commit/77f8c6d6881dcc5f4918f2c6b7355461224d3a2d))
* **met.no:** change cloud coverage to percentage ([6c125c7](https://github.com/kaiser-jan/weather-pwa/commit/6c125c73d052189af9200470d61135235f50e260))
* **met.no:** combine timeperiod data independent of period length ([2304305](https://github.com/kaiser-jan/weather-pwa/commit/2304305c26c029775a4803dddd121375ccfffeee))
* **met.no:** correctly parse expires header for cache expiry ([4755568](https://github.com/kaiser-jan/weather-pwa/commit/4755568d29b50afd79fc2f0c29c5bde35ed5351d))
* **met.no:** safari bug with map to array conversion ([b494529](https://github.com/kaiser-jan/weather-pwa/commit/b494529f9ea78c6f982e8bd28533248ad1ba78e9))
* **provider:** migrate select component ([3d7c96a](https://github.com/kaiser-jan/weather-pwa/commit/3d7c96ab85657de8af618c2453ed07b18184ff3a))
* **providers:** properly reactive data when switching providers ([ac3f45e](https://github.com/kaiser-jan/weather-pwa/commit/ac3f45efd03d434664ba580b9aa5f58884a0469d))
* **pwa:** make buttons clickable again ([d1731fe](https://github.com/kaiser-jan/weather-pwa/commit/d1731fe35fd84be758b20e765b6661383edb0e66))
* **reactivity:** update datetime and data when app becomes visible ([67b1241](https://github.com/kaiser-jan/weather-pwa/commit/67b12419e2a196bd1a7cc4d3795cb5ebc674b859))
* **settings:** fallback version if no changelog present ([71e66b2](https://github.com/kaiser-jan/weather-pwa/commit/71e66b264c20535ba8c57bcbf4501e802856706a))
* **settings:** navigating to settings in groups broken ([6bd73db](https://github.com/kaiser-jan/weather-pwa/commit/6bd73dbe34bd435d853d4aaa878aadf41963c5d0))
* **settings:** proper equality check when using select subscription ([4dc33ae](https://github.com/kaiser-jan/weather-pwa/commit/4dc33ae43791ecf644631c2f88490f37da8cbec1))
* **settings:** select reactivity broken due to change detection ([47f7841](https://github.com/kaiser-jan/weather-pwa/commit/47f784131babf078732573145fe2cc2e19372c69))
* **settings:** swipe nav broken due to zero height container ([ba6eee9](https://github.com/kaiser-jan/weather-pwa/commit/ba6eee975efc7b7dfc618d07eca6ec55b1cc901f))
* **symbol:** remove possible race condition ([fdff951](https://github.com/kaiser-jan/weather-pwa/commit/fdff951c00a14959120a62ef446590b21ba9f3e9))
* **symbols:** correct some symbol names ([31c5b39](https://github.com/kaiser-jan/weather-pwa/commit/31c5b397364c4236347169c592852221fdb836bd))
* **timeline-bar:** blocks shifted by incorrect datetime calculation ([ef8e1d9](https://github.com/kaiser-jan/weather-pwa/commit/ef8e1d9d32bf2cad15939afb6ec94574eba6bb66))
* **timeline-bar:** limit items to endDatetime ([85c81d6](https://github.com/kaiser-jan/weather-pwa/commit/85c81d6e2c26ba957d6c15d268f70c67b0390a7b))
* **timeline-bar:** remove empty block at end of day ([3c2670f](https://github.com/kaiser-jan/weather-pwa/commit/3c2670fcc7d68247eda50c0aa0d4b0b1a374127f))
* **units:** show more decimal places for precipitation groups ([3010943](https://github.com/kaiser-jan/weather-pwa/commit/3010943e0215bba1d8492cd733990cb9080c80f7))
* **ux:** various small improvements ([b7ee17e](https://github.com/kaiser-jan/weather-pwa/commit/b7ee17e115bab98ab7d14c42849e0fe0de5bc4e3))


### Features

* add loading skeleton ([0ce5c1d](https://github.com/kaiser-jan/weather-pwa/commit/0ce5c1d00568cfc660c93d9055fb782b7dea46e5))
* **chart:** add cape, cin and grad ([8281ab2](https://github.com/kaiser-jan/weather-pwa/commit/8281ab222ddec54df1937638e9db8cf87ff5ed3e))
* **chart:** add inline highlighted parameter values ([f046d09](https://github.com/kaiser-jan/weather-pwa/commit/f046d0970f05464f099a146d13ff4b17c12ac6c3))
* **chart:** add neighboring values to daily multiseries ([f28c605](https://github.com/kaiser-jan/weather-pwa/commit/f28c60595c2461e2ede6e72ab03faf06ce0797d2))
* **chart:** add option to highlight extrema ([1f44801](https://github.com/kaiser-jan/weather-pwa/commit/1f44801e1088381f7e68ac16743839aa024bd0ab))
* **chart:** add options for y axis unit placement ([9ca03b2](https://github.com/kaiser-jan/weather-pwa/commit/9ca03b2a8a16125ac19664a3a42e1ecd6b1ed018))
* **chart:** add parameter icons to tooltip ([a7cea0e](https://github.com/kaiser-jan/weather-pwa/commit/a7cea0e00a80bdcda6c7bea31c6d892219000078))
* **chart:** add precipitation amount bar chart ([1307f3a](https://github.com/kaiser-jan/weather-pwa/commit/1307f3a3b6964e20d969d8cce5ee4c1a750d85f8))
* **chart:** add remaining common parameters ([3326f13](https://github.com/kaiser-jan/weather-pwa/commit/3326f13683092a5b442109bcd20b83172c2922e2))
* **chart:** allow parameters to display multiple series ([166dcc5](https://github.com/kaiser-jan/weather-pwa/commit/166dcc5449adcfb248c804ef2bde460889efc817))
* **chart:** auto-select domain per parameter based on extent ([85152c6](https://github.com/kaiser-jan/weather-pwa/commit/85152c667887d5343209e58762d2aad90fdaccda))
* **chart:** basic temperature chart using d3 ([00da6b0](https://github.com/kaiser-jan/weather-pwa/commit/00da6b0928bfeedcc74243da774a1f07cbd73a13))
* **chart:** calculate offsets to support multiple y axis ([74b92ce](https://github.com/kaiser-jan/weather-pwa/commit/74b92ceee33f48705ebd73888bf98e3edee613ea))
* **chart:** display highlighted values in header ([bfdca17](https://github.com/kaiser-jan/weather-pwa/commit/bfdca17242de03b4ab3a5360379203caab4c1c4f))
* **chart:** display highlighted values in header ([5679df0](https://github.com/kaiser-jan/weather-pwa/commit/5679df0eabf24cd872969ead7e95568cb5ccc33b))
* **chart:** improve axis pointer interaction ([22291e8](https://github.com/kaiser-jan/weather-pwa/commit/22291e8092011e60bb8a8fb06424422188952e3b))
* **chart:** make chart day label scroll to current day on click ([ffc71c4](https://github.com/kaiser-jan/weather-pwa/commit/ffc71c48955b438c3f24a460ca353bcb425a4e7d))
* **chart:** parameter selection pinning and overflow popover ([7255db7](https://github.com/kaiser-jan/weather-pwa/commit/7255db72e876bfb1470cff356d8594e280410241))
* **chart:** swipe through daily charts ([ef9c973](https://github.com/kaiser-jan/weather-pwa/commit/ef9c973ad9f86ad1aa8d553912be31b80efa109d))
* **chart:** toggle visibility of each parameter ([4971b33](https://github.com/kaiser-jan/weather-pwa/commit/4971b33a15a74264afa23c381b416c37d0b6672d))
* **chart:** tooltip positioning ([7a4d5b9](https://github.com/kaiser-jan/weather-pwa/commit/7a4d5b93bf9171e2f035d05f7402326c08cd3556))
* **chart:** x axis pointer with tooltip ([30af090](https://github.com/kaiser-jan/weather-pwa/commit/30af0908202b22efc1c77e31942abb5fa81522ae))
* **color-bar:** add value-scaled dots for wind ([31d2bd2](https://github.com/kaiser-jan/weather-pwa/commit/31d2bd24bff3062efb68a7fff599d5991ef1490c))
* **color-bar:** rework to date-based display ([b14476b](https://github.com/kaiser-jan/weather-pwa/commit/b14476b4ecd96b657319f1facf9467b2b7ff4f1a))
* **color-bar:** show rain in categories ([b291df2](https://github.com/kaiser-jan/weather-pwa/commit/b291df21f96d44ac208f449346db2a1c6cd39f6d))
* **config:** option to omit TimelineBar for incomplete days ([9ec142f](https://github.com/kaiser-jan/weather-pwa/commit/9ec142f0b54e4546f71c63824958aee38f72b5e5))
* **current:** add pressure and relative humidity ([2ba5b46](https://github.com/kaiser-jan/weather-pwa/commit/2ba5b466ef394316628eb66298a2e1bdebf1061c))
* **current:** add radial gradient behind symbol for contrast ([0ff4cd8](https://github.com/kaiser-jan/weather-pwa/commit/0ff4cd85ade03eb13bdfddbe7fe841d37d6cec69))
* **current:** show precipitation start or end datetime ([394483d](https://github.com/kaiser-jan/weather-pwa/commit/394483d2e955e2fe36ee8a8216d7ba8945eca647))
* **current:** slightly adapt to changes ([b2a1637](https://github.com/kaiser-jan/weather-pwa/commit/b2a1637641fe9ff71c8c109347ae41d70066ffeb))
* **current:** stick to top and shrink on scroll ([bf61c7b](https://github.com/kaiser-jan/weather-pwa/commit/bf61c7b74e4b7d374e65e1575757c72fa50430c0))
* **current:** style basic current info ([50b75ba](https://github.com/kaiser-jan/weather-pwa/commit/50b75ba7fb50154145343bbb824df9d8d21ba8f8))
* **daily:** add option to use temperature range bar over color dots ([1bf2bf7](https://github.com/kaiser-jan/weather-pwa/commit/1bf2bf7984a9a244e907a31c51c8bbd7f17ac19f))
* **daily:** omit incomplete days derived from hourly ([a47ed07](https://github.com/kaiser-jan/weather-pwa/commit/a47ed07b8ec0714ff793f9b1e8e500b9e2a0a15f))
* **data:** fetch and process forecast from met.no ([ff24857](https://github.com/kaiser-jan/weather-pwa/commit/ff24857733ecef0fdb469dad8a85bea082033182))
* **data:** limit cached responses per dataset ([0d661ca](https://github.com/kaiser-jan/weather-pwa/commit/0d661caf02b680bffce8f527c4108a2a84453636))
* **data:** loading based on datasets config option ([a627b47](https://github.com/kaiser-jan/weather-pwa/commit/a627b4766361bab5bb9ddc64da5885a1abbe3247))
* **data:** still show data if models fail to load ([15ff5b3](https://github.com/kaiser-jan/weather-pwa/commit/15ff5b30c6d5f7c2aa1f3844d62a5a52062e512c))
* **data:** stream in loaded datasets in increments ([39ecd74](https://github.com/kaiser-jan/weather-pwa/commit/39ecd746dd0edf4bd3e4c98346803357f0ba7720))
* **data:** use cached forecast while loading from api ([7f6e181](https://github.com/kaiser-jan/weather-pwa/commit/7f6e181fa2bb405f151de0758fc7a778a44befe6))
* **day:** add precipitation groups ([59dbb28](https://github.com/kaiser-jan/weather-pwa/commit/59dbb2813b35400f353d806a814f9ea2286c572e))
* **day:** add timeline bar ([654b772](https://github.com/kaiser-jan/weather-pwa/commit/654b772b6230d5cb70c8fc575cd472e3d54e32b3))
* **day:** allow swiping today chart to open tomorrow details ([5e777f0](https://github.com/kaiser-jan/weather-pwa/commit/5e777f0f47b1ff09d4179b0bddfb17761a6d144a))
* **day:** basic day view drawer with chart and value range bars ([04fba2f](https://github.com/kaiser-jan/weather-pwa/commit/04fba2f83f302070c232fea20b732d05095e8de8))
* **day:** slightly improve how parameters are displayed ([fc15c3b](https://github.com/kaiser-jan/weather-pwa/commit/fc15c3b8862337fe6b253150d6f5bbbaf77a2bb2))
* **day:** use parameter summaries as chart parameter selection ([d839fa7](https://github.com/kaiser-jan/weather-pwa/commit/d839fa79dd4aa9e15ea44dc98d0b780a03409d94))
* **geolocation:** geolocation state indicator ([4e5e242](https://github.com/kaiser-jan/weather-pwa/commit/4e5e242b86c3609ad0d53ec36fb08bfd16993f1b))
* **geosphere.at:** add nowcast ([99931bc](https://github.com/kaiser-jan/weather-pwa/commit/99931bc4f86610a690de33560cc34493d4af836d))
* **geosphere.at:** include passed hours from current forecast ([076368a](https://github.com/kaiser-jan/weather-pwa/commit/076368aa58ae9dbc273f63ce72bd368b2bbb53da))
* **geosphere.at:** load old forecast to fill in today's hourly ([fdbca07](https://github.com/kaiser-jan/weather-pwa/commit/fdbca076fc4dee233d8a1bb84605f15174370cde))
* **geosphere.at:** parallel api calls ([ec1846f](https://github.com/kaiser-jan/weather-pwa/commit/ec1846ff5ed83209739520919fca43693a2dc233))
* **hourly:** day color bar cloud_coverage and precipitation ([18bf154](https://github.com/kaiser-jan/weather-pwa/commit/18bf1542cd9957b9a191ada4e1d3ad2ad0bbafd8))
* **hourly:** hourly temperature color bar ([9d0c5b2](https://github.com/kaiser-jan/weather-pwa/commit/9d0c5b2f843c2e521d31a46f81d9222f6ac61cd0))
* **location:** add placeholders for search results ([b056967](https://github.com/kaiser-jan/weather-pwa/commit/b056967f53c2803c701dedb9e5f028c3ff0172ca))
* **location:** location preset selector ([459bccd](https://github.com/kaiser-jan/weather-pwa/commit/459bccd1132a8df906d9ce905e6a6f9ba5a6555e))
* **location:** location search and selection ([b257b86](https://github.com/kaiser-jan/weather-pwa/commit/b257b862784d34f79d52429807f42869080c621b))
* **location:** reverse geocoding and location refresh ([449bcd4](https://github.com/kaiser-jan/weather-pwa/commit/449bcd44aef90bf8dd6829757cb2961172d2d3c1))
* **locations:** make lat lon and altitude editable ([7bad5f5](https://github.com/kaiser-jan/weather-pwa/commit/7bad5f5e79d7ec111573248315370a9a439bbee9))
* **locations:** saving and unsaving locations ([7833084](https://github.com/kaiser-jan/weather-pwa/commit/783308439fcbb314ef67cb437f8859928ae9502e))
* **met.no:** process data to daily ([c28b5a4](https://github.com/kaiser-jan/weather-pwa/commit/c28b5a4a690ac194c0ddca44fb547992afb86d66))
* **met.no:** use time periods of all lengths ([35be8b6](https://github.com/kaiser-jan/weather-pwa/commit/35be8b6a06903111e7f1dc38d53f8f39a49a4ca2))
* **notices:** add precipitation notice ([51b45db](https://github.com/kaiser-jan/weather-pwa/commit/51b45db85506006bd34ba90483e4194f90bfd932))
* **outlook:** make rain optional, fix to 7 days ([ff8696f](https://github.com/kaiser-jan/weather-pwa/commit/ff8696f2273e7088bfa2c06f97d9a38ece6ebbed))
* **precipitation:** group sporadic precipitation in notice ([9c22760](https://github.com/kaiser-jan/weather-pwa/commit/9c22760976a24e9efd5d8078f746a60a494a4a8f))
* **provider-geosphere.at:** forecast based on 60-hour model ([c7611f8](https://github.com/kaiser-jan/weather-pwa/commit/c7611f84b96045693b7bfde6e08418bb31264df6))
* **provider-met.no:** allow instant based data for daily ([f5aa58b](https://github.com/kaiser-jan/weather-pwa/commit/f5aa58bcb07d85892b92b91f87a3808514ca2c67))
* **provider:** persist provider selection ([ff38b19](https://github.com/kaiser-jan/weather-pwa/commit/ff38b19083a86612d7a8f06b7a304cfaa59ddb14))
* **providers:** provider select ([4f32b3e](https://github.com/kaiser-jan/weather-pwa/commit/4f32b3ed79c8562a4e5f466ee5a9ef64fc6dc3dc))
* **providers:** rework structure and add response caching ([cc2c21a](https://github.com/kaiser-jan/weather-pwa/commit/cc2c21ab3d864adb75320897187760a79d632a13))
* **pwa:** add styled pwa options ([6cb59f2](https://github.com/kaiser-jan/weather-pwa/commit/6cb59f22e88ad9c6eeb3f7fbe5c51db4d5e441d9))
* **pwa:** reactive service worker state ([b3ed6e7](https://github.com/kaiser-jan/weather-pwa/commit/b3ed6e71ef5d1b1cd0d52fd001dbd0c584971773))
* **reactivity:** use one global current datetime ([f181b91](https://github.com/kaiser-jan/weather-pwa/commit/f181b91b94244b1ef2427a095b8b8ee577dd40f9))
* **sections:** add daily outlook section ([9da7d57](https://github.com/kaiser-jan/weather-pwa/commit/9da7d576462f30eb90c6dd0265f442006df7f9eb))
* **sections:** optional section titles ([5093e5f](https://github.com/kaiser-jan/weather-pwa/commit/5093e5f42cf58ceaa3e87bd469b387ff532cbc08))
* **settings:** add about.author section ([b1dad39](https://github.com/kaiser-jan/weather-pwa/commit/b1dad39037212a41090e6ff0020132d08de21bbf))
* **settings:** add basic list support for locations ([f786090](https://github.com/kaiser-jan/weather-pwa/commit/f786090847da7f5ce26015a2e495464e9c7ebbad))
* **settings:** add changelog ([2abe652](https://github.com/kaiser-jan/weather-pwa/commit/2abe652cbfe437db69bcb83952c23954ad586113))
* **settings:** add icons ([e5332ec](https://github.com/kaiser-jan/weather-pwa/commit/e5332ec9a363637e51b5b50a69631446dbf67f2a))
* **settings:** add version page for updating etc ([465f1fe](https://github.com/kaiser-jan/weather-pwa/commit/465f1fe47f0ddd1f2da57df54ad0ae4491cdffe8))
* **settings:** allow subscribing only to a part of the settings ([794ef8d](https://github.com/kaiser-jan/weather-pwa/commit/794ef8d647d4a2a120118ea85dc6f1617743a2b0))
* **settings:** basic list reorder support for locations ([b3312ce](https://github.com/kaiser-jan/weather-pwa/commit/b3312ce710fa4d2c8e787a5ea1747b385303c176))
* **settings:** clean up ui ([4c80d32](https://github.com/kaiser-jan/weather-pwa/commit/4c80d32a58ca9dc8160b104fbcd235d900f1e9ea))
* **settings:** config-based settings ui basic values ([1788b35](https://github.com/kaiser-jan/weather-pwa/commit/1788b35a6c97a814aac46aaddafe9aa3f520e9bc))
* **settings:** display current version ([c033130](https://github.com/kaiser-jan/weather-pwa/commit/c033130a201ac481979feaeb94f72fdfc96e11fe))
* **settings:** multiselect for datasets ([7a8f3c0](https://github.com/kaiser-jan/weather-pwa/commit/7a8f3c0182d98b283987efef39afb4cf9de8f0f1))
* **settings:** swipe forward/back navigation ([a63ebdb](https://github.com/kaiser-jan/weather-pwa/commit/a63ebdb67628b694844459e60c4f94b19364ff6a))
* **settings:** use absolute position instead of scroll for pages ([10a74cc](https://github.com/kaiser-jan/weather-pwa/commit/10a74cc12661c7cf0cc6a1a429b84b1821a85730))
* **settings:** write changed settings to localStorage ([5ccfba0](https://github.com/kaiser-jan/weather-pwa/commit/5ccfba0abbe3d62e87bda3394aad9badb29692bd))
* **sky:** implement sun based sky rendering ([425d8d1](https://github.com/kaiser-jan/weather-pwa/commit/425d8d1fcc20d4d1759bd1b7631fa4dd299b87d7))
* **symbol:** current weather symbol with intermediate decoupling layer ([f30597e](https://github.com/kaiser-jan/weather-pwa/commit/f30597e56f7d97d9758b6ede95ee08ffc9312b85))
* **symbols:** add option for animated meteocons ([ec39a38](https://github.com/kaiser-jan/weather-pwa/commit/ec39a38b0c6d69338f1314804c2a1d21d3ed3d68))
* **symbols:** derive weather situations from forecast ([cac7050](https://github.com/kaiser-jan/weather-pwa/commit/cac70506d53067e46d0b6f28c1acf2814b3b6f1d))
* **symbols:** use day/night variants ([87e9ec0](https://github.com/kaiser-jan/weather-pwa/commit/87e9ec022d6878318a598cc33cc90e9b9454cace))
* **temperature:** temperature range gradient ([e191063](https://github.com/kaiser-jan/weather-pwa/commit/e191063642ea4f8ed92b6937076d3d54402318df))
* **timeline-bar:** add timestamp marks option ([7a7f2d8](https://github.com/kaiser-jan/weather-pwa/commit/7a7f2d864693602f634890855a117ad53b619dff))
* **timeline-bar:** add uvi parameter ([a03768f](https://github.com/kaiser-jan/weather-pwa/commit/a03768fe01e8dd860626d133f989efcfb53cf055))
* **timeline-bar:** approximate sun and moon light ([515b9d9](https://github.com/kaiser-jan/weather-pwa/commit/515b9d93472716b4f2125ef7456ee7de8a3d33ed))
* **timeline-bar:** show passed hours and mark them accordingly ([d2ec38d](https://github.com/kaiser-jan/weather-pwa/commit/d2ec38de40f88c2859b83372d602ac29e5aed237))
* **today:** add option to hide chart parameter select ([eeddf3d](https://github.com/kaiser-jan/weather-pwa/commit/eeddf3db570199e2bad0d4499f2c1ed4aeeeb442))
* **units:** allow some units to prefer showing decimals ([3ac06ed](https://github.com/kaiser-jan/weather-pwa/commit/3ac06ed86e7f086e6536f1580ee3877bfed5ae36))
* **units:** basic unit options and conversion ([d79568f](https://github.com/kaiser-jan/weather-pwa/commit/d79568fda432d7d2c6e90a46697453d6000348bd))


### Performance Improvements

* **data:** reduce date calculations during merge ([4c01f0c](https://github.com/kaiser-jan/weather-pwa/commit/4c01f0c30c56994cea84589a6fc22b9834e7b064))
