import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { mediaStyles } from 'styles/media';
import Colors from 'styles/theme/colors';
import GlobalLoader from 'components/GlobalLoader';
import Script from 'next/script';

const PRELOADED_FONTS = [
  '/fonts/Inter-Regular.woff2',
  '/fonts/Inter-SemiBold.woff2',
  '/fonts/Inter-Bold.woff2',
  '/fonts/GT-America-Mono-Bold.woff2',
  '/fonts/GT-America-Extended-Bold.woff2',
  '/fonts/GT-America-Condensed-Medium.woff2',
  '/fonts/GT-America-Condensed-Bold.woff2',
];

export default class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const styledComponentsSheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App: any) => (props: any) =>
            styledComponentsSheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {styledComponentsSheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      styledComponentsSheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <style type="text/css" dangerouslySetInnerHTML={{ __html: mediaStyles }} />
          <style
            type="text/css"
            dangerouslySetInnerHTML={{
              __html: `
                body {
                  background-color: ${Colors.black};
                }
              `,
            }}
          />
          {PRELOADED_FONTS.map((fontPath) => (
            <link
              key={fontPath}
              rel="preload"
              href={fontPath}
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          ))}
          {/* matomo */}
          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            var _paq = window._paq = window._paq || [];
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="https://analytics.synthetix.io/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '3']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();
        `,
            }}
          />
        </Head>
        <body>
          <Main />
          <div id="global-loader">
            <GlobalLoader />
          </div>
          <NextScript />
        </body>
      </Html>
    );
  }
}
