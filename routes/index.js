var express = require("express");
var async = require("async");
const request = require("request");
var router = express.Router();

function getPlaces(keyword, x, y) {
	const option = {
		uri: "https://dapi.kakao.com/v2/local/search/keyword.json",
		qs: {
			query: keyword,
			x: x,
			y: y,
		},
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			Authorization: "KakaoAK edc0023eaa2baf256dfa540055bddb9e",
		},
	};

	return new Promise((resolve) => {
		request(option, function (error, response, body) {
			var places = JSON.parse(response.body).documents;
			resolve(places);
		});
	});
}

function getBasicInfo(id) {
	return new Promise((resolve) => {
		request("https://place.map.kakao.com/main/v/" + id, async function (
			error,
			response,
			body
		) {
			var html = JSON.parse(response.body);
			var basicInfo = {};

			// isOpen
			var isOpen = html.basicInfo.openHour.realtime.open;
			basicInfo.isOpen = isOpen;

			// imgUrl
			var imgUrl = html.basicInfo.mainphotourl;
			if (imgUrl) {
				basicInfo.imgUrl = imgUrl;
			} else {
				basicInfo.imgUrl =
					"http://t1.daumcdn.net/localimg/localimages/07/2017/pc/bg_nodata.png";
			}
			resolve(basicInfo);
		});
	});
}

router.get("/keyword", function (req, res, next) {
	var placesList;
	var keyword = req.query.keyword;
	var x = req.query.x;
	var y = req.query.y;

	getPlaces(keyword, x, y).then(async function (results) {
		placesList = results;

		for (const place of placesList) {
			await getBasicInfo(place.id).then((res) => {
				var RandVal =
					Math.floor(Math.random() * (2500 - 300 + 1)) + 300;
				RandVal = RandVal * 0.001;
				place.isOpen = res.isOpen;
				place.imgUrl = res.imgUrl;
				place.congestion = RandVal;
			});
		}

		res.json(placesList);
	});
});

router.get("/confirmed", function (req, res, next) {
	var x = req.query.x;
	var y = req.query.y;
});

module.exports = router;
