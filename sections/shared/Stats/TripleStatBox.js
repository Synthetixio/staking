"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var styled_components_1 = require("styled-components");
var react_i18next_1 = require("react-i18next");
var common_1 = require("styles/common");
var snx_stat_background_svg_1 = require("assets/svg/app/snx-stat-background.svg");
var number_1 = require("utils/formatters/number");
var routes_1 = require("constants/routes");
var router_1 = require("next/router");
var TripleStatBox = function (_a) {
    var stakedValue = _a.stakedValue, activeDebt = _a.activeDebt, stakingApy = _a.stakingApy, cRatio = _a.cRatio;
    var t = react_i18next_1.useTranslation().t;
    var theme = styled_components_1.useTheme();
    var route = router_1.useRouter().route;
    var returnStakedValue = function () { return (<StatBox key={'staked-value'} style={{
        backgroundImage: "url(" + snx_stat_background_svg_1["default"] + ")"
    }}>
			<StatTitle titleColor={theme.colors.brightBlue}>
				{t('common.stat-box.staked-value')}
			</StatTitle>
			<StatValue>{number_1.formatFiatCurrency(stakedValue ? stakedValue : 0, { sign: '$' })}</StatValue>
		</StatBox>); };
    var returnApy = function () { return (<StatBox key={'earning'} style={{
        backgroundImage: "url(" + snx_stat_background_svg_1["default"] + ")"
    }}>
			<StatTitle titleColor={theme.colors.brightGreen}>{t('common.stat-box.earning')}</StatTitle>
			<NeonValue>{number_1.formatPercent(stakingApy ? stakingApy : 0)}</NeonValue>
		</StatBox>); };
    var returnCRatio = function () { return (<StatBox key={'cRatio'} style={{
        backgroundImage: "url(" + snx_stat_background_svg_1["default"] + ")"
    }}>
			<StatTitle titleColor={theme.colors.brightGreen}>{t('common.stat-box.c-ratio')}</StatTitle>
			<NeonValue>{cRatio ? Math.round(100 / cRatio) : 0}%</NeonValue>
		</StatBox>); };
    var returnActiveDebt = function () { return (<StatBox key={'active-debt'} style={{
        backgroundImage: "url(" + snx_stat_background_svg_1["default"] + ")"
    }}>
			<StatTitle titleColor={theme.colors.brightPink}>{t('common.stat-box.active-debt')}</StatTitle>
			<StatValue>{number_1.formatFiatCurrency(activeDebt ? activeDebt : 0, { sign: '$' })}</StatValue>
		</StatBox>); };
    var returnStats = function () {
        switch (route) {
            case routes_1["default"].Home:
                return (<>
						{returnStakedValue()}
						{returnApy()}
						{returnActiveDebt()}
					</>);
            case routes_1["default"].Staking.Home:
                return (<>
						{returnStakedValue()}
						{returnCRatio()}
						{returnActiveDebt()}
					</>);
            case routes_1["default"].Earn.Home:
                return (<>
						{returnStakedValue()}
						{returnApy()}
						{returnActiveDebt()}
					</>);
        }
    };
    return <StatsSection>{returnStats()}</StatsSection>;
};
var StatsSection = styled_components_1["default"](common_1.FlexDivRowCentered)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n\twidth: 100%;\n\tjustify-content: center;\n\tmargin: 0 auto;\n"], ["\n\twidth: 100%;\n\tjustify-content: center;\n\tmargin: 0 auto;\n"])));
var StatBox = styled_components_1["default"](common_1.FlexDivColCentered)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n\theight: 200px;\n\twidth: 400px;\n\tbackground-image: url('assets/svg/snx-stat-background.svg');\n\tbackground-position: center;\n\tbackground-repeat: no-repeat;\n\tjustify-content: center;\n\tmargin: 0px 20px;\n"], ["\n\theight: 200px;\n\twidth: 400px;\n\tbackground-image: url('assets/svg/snx-stat-background.svg');\n\tbackground-position: center;\n\tbackground-repeat: no-repeat;\n\tjustify-content: center;\n\tmargin: 0px 20px;\n"])));
var StatTitle = styled_components_1["default"].p(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n\tfont-family: ", ";\n\tfont-size: 14px;\n\tcolor: ", ";\n\tmargin: 0;\n"], ["\n\tfont-family: ", ";\n\tfont-size: 14px;\n\tcolor: ", ";\n\tmargin: 0;\n"])), function (props) { return props.theme.fonts.condensedMedium; }, function (props) { return props.titleColor; });
var NeonValue = styled_components_1["default"].p(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n\tfont-family: ", ";\n\tfont-size: 42px;\n\tmargin: 0;\n\t/* text-shadow: rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,\n\t\trgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,\n\t\trgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px; */\n\ttext-shadow: rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,\n\t\trgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,\n\t\trgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px;\n\tcolor: #073124;\n"], ["\n\tfont-family: ", ";\n\tfont-size: 42px;\n\tmargin: 0;\n\t/* text-shadow: rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,\n\t\trgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,\n\t\trgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px; */\n\ttext-shadow: rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,\n\t\trgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,\n\t\trgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px;\n\tcolor: #073124;\n"])), function (props) { return props.theme.fonts.expanded; });
var StatValue = styled_components_1["default"].p(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n\tfont-family: ", ";\n\tfont-size: 34px;\n\tmargin: 0;\n"], ["\n\tfont-family: ", ";\n\tfont-size: 34px;\n\tmargin: 0;\n"])), function (props) { return props.theme.fonts.expanded; });
exports["default"] = TripleStatBox;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
