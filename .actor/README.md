Input Analyzer summarizes the occurence of field variations in list of run inputs. It also supports nested values.

Output is an object with counts of each field variation. For example:

```json
{
	"countryCode": {
		"es": 3
	},
	"city": {
		"madrid": 3
	},
	"searchStringsArray": {
		"nightclub": 1,
		"hotel": 1,
		"restaurant": 1,
		"cafe": 1,
		"pub": 1
	},
	"zoom": {
		"13": 3
	},
	"exportPlaceUrls": {
		"true": 2,
		"false": 1
	},
	"language": {
		"en": 3
	},
	"oneReviewPerRow": {
		"false": 3
	},
	"reviewsSort": {
		"newest": 3
	},
	"reviewsTranslation": {
		"originalAndTranslated": 3
	},
	"proxyConfig": {
		"useApifyProxy": {
			"true": 3
		},
	},
	"allPlacesNoSearchAction": {
		"": 3
	}
}
```