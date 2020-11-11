"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var react_1 = require("react");
var styled_components_1 = require("styled-components");
var react_i18next_1 = require("react-i18next");
var common_1 = require("styles/common");
var ProgressBar_1 = require("components/ProgressBar");
var react_countdown_1 = require("react-countdown");
var ClaimedTag_1 = require("components/ClaimedTag");
var BarStats = function (_a) {
    var currentCRatio = _a.currentCRatio, targetCRatio = _a.targetCRatio, claimed = _a.claimed, nextFeePeriodStarts = _a.nextFeePeriodStarts, currentFeePeriodProgress = _a.currentFeePeriodProgress;
    var t = react_i18next_1.useTranslation().t;
    var theme = styled_components_1.useTheme();
    var percentage = currentCRatio !== null && currentCRatio !== void 0 ? currentCRatio : Math.round(100 / currentCRatio) + "/" + Math.round(100 / targetCRatio);
    var returnCRatio = react_1.useMemo(function () { return (<BarStatBox key="CRATIO">
				<BarHeaderSection>
					<BarTitle>{t('dashboard.bar.c-ratio')}</BarTitle>
					<BarValue>{percentage}%</BarValue>
				</BarHeaderSection>
				<ShadowCRatioBar percentage={percentage} borderColor={theme.colors.brightPink} fillColor={theme.colors.brightBlue}/>
			</BarStatBox>); }, [currentCRatio, targetCRatio, t, theme]);
    return (<BarStatsContainer>
			{returnCRatio}
			<BarStatBox key="PERIOD">
				<BarHeaderSection>
					<BarTitle>
						{t('dashboard.bar.period.title')} &bull; <StyledClaimedTag isClaimed={claimed}/>
					</BarTitle>
					<BarValue>
						<react_countdown_1["default"] date={nextFeePeriodStarts}/>
					</BarValue>
				</BarHeaderSection>
				<ShadowPeriodBar percentage={currentFeePeriodProgress} borderColor={theme.colors.brightGreen} fillColor={theme.colors.brightGreen}/>
			</BarStatBox>
		</BarStatsContainer>);
};
var ShadowCRatioBar = styled_components_1["default"](ProgressBar_1["default"])(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n\t.filled-bar {\n\t\tbox-shadow: 0px 0px 15px rgba(0, 209, 255, 0.6);\n\t\ttransform: matrix(-1, 0, 0, 1, 0, 0);\n\t}\n"], ["\n\t.filled-bar {\n\t\tbox-shadow: 0px 0px 15px rgba(0, 209, 255, 0.6);\n\t\ttransform: matrix(-1, 0, 0, 1, 0, 0);\n\t}\n"])));
var ShadowPeriodBar = styled_components_1["default"](ProgressBar_1["default"])(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n\t.filled-bar {\n\t\tbox-shadow: 0px 0px 15px rgba(77, 244, 184, 0.25);\n\t\ttransform: matrix(-1, 0, 0, 1, 0, 0);\n\t}\n"], ["\n\t.filled-bar {\n\t\tbox-shadow: 0px 0px 15px rgba(77, 244, 184, 0.25);\n\t\ttransform: matrix(-1, 0, 0, 1, 0, 0);\n\t}\n"])));
var BarStatsContainer = styled_components_1["default"](common_1.FlexDiv)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n\twidth: 100%;\n\tjustify-content: space-between;\n"], ["\n\twidth: 100%;\n\tjustify-content: space-between;\n"])));
var BarStatBox = styled_components_1["default"](common_1.FlexDivCol)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n\twidth: 480px;\n\tmargin-bottom: 50px;\n"], ["\n\twidth: 480px;\n\tmargin-bottom: 50px;\n"])));
var BarHeaderSection = styled_components_1["default"](common_1.FlexDivRowCentered)(templateObject_5 || (templateObject_5 = __makeTemplateObject([""], [""])));
var BarTitle = styled_components_1["default"](common_1.FlexDivCentered)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n\tfont-size: 14px;\n\tfont-family: ", ";\n\tcolor: ", ";\n"], ["\n\tfont-size: 14px;\n\tfont-family: ", ";\n\tcolor: ", ";\n"])), function (props) { return props.theme.fonts.condensedMedium; }, function (props) { return props.theme.colors.silver; });
var BarValue = styled_components_1["default"].p(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n\tfont-size: 16px;\n\tcolor: ", ";\n\tfont-family: ", ";\n"], ["\n\tfont-size: 16px;\n\tcolor: ", ";\n\tfont-family: ", ";\n"])), function (props) { return props.theme.colors.white; }, function (props) { return props.theme.fonts.mono; });
var StyledClaimedTag = styled_components_1["default"](ClaimedTag_1["default"])(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n\ttext-transform: uppercase;\n\tmargin-left: 4px;\n\tfont-size: 14px;\n"], ["\n\ttext-transform: uppercase;\n\tmargin-left: 4px;\n\tfont-size: 14px;\n"])));
exports["default"] = BarStats;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
