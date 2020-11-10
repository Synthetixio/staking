import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { mediaStyles } from 'styles/media';

const PRELOADED_FONTS = [
	'/fonts/GT-America-Mono-Bold.woff2',
	'/fonts/GT-America-Expanded-Black.woff2',
	'/fonts/GT-America-Condensed-Medium.woff2',
	'/fonts/GT-America-Condensed-Bold.woff2',
	'/fonts/inter-v2-latin-regular.woff2',
	'/fonts/inter-v2-latin-600.woff2',
	'/fonts/inter-v2-latin-800.woff2',
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
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
