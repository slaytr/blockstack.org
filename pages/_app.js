import App, { Container } from 'next/app'
import React from 'react'
import Header from '@components/header'
import Footer from '@components/footer'
import NoTemplate from '@components/templates/none'
import DefaultPageTemplate from '@components/templates/default'
import Head from 'next/head'
import { Mdx } from '@components/mdx'
import withReduxStore from '@common/withReduxStore'
import { createGlobalStyle } from 'styled-components'
import { Provider as ReduxProvider } from 'redux-bundler-react'
import { styles } from '@common/legacy-styles'

const fetchOurData = async (ctx) => {
  if (!ctx.reduxStore.selectJobs()) {
    await ctx.reduxStore.doFetchJobsData()
  }
}

const Global = createGlobalStyle`
.header{
  a:link{
    text-decoration: none !important;
  }
  div.col.center.align-center{
    z-index: 999999;
    max-width: calc(100% - 120px)
  }
  .es-logo{
    display: inline-block !important;
    text-decoration: none !important;
    &:hover{
    text-decoration: none !important;    
    border-bottom-color: transparent !important;
    }
  }
  .menu-toggle{
    position: relative;
    z-index: 9999999;
  }
  transition: 0.25s all ease-in-out;
  svg .logo-bg{
    transition: 0.25s all ease-in-out;
  }
}
.headroom.headroom--scrolled{
  box-shadow: 0 3px 12px rgba(37,0,105,.32);
    .bs-logo {
      transform: scale(1) transformY(1px);
    }
    .bs-logotype {
      opacity: 0;
      visibility: hidden;
      transform: translate3d(-16px, 0, 0);
    }
  .center-actions {
    .button.main-action,
    .newsletter-form {
      opacity: 1;
      visibility: visible;
      transform: none;
      svg {
        * {
          mix-blend-mode: screen;
          fill: white !important;
        }
      }
    }
  }
  .header{
    background:#211f6d;
    svg .logo-bg{
      fill: transparent!important;
    }   
  }
}`

const renderTemplate = (template) => {
  switch (template) {
    case 'NONE':
      return NoTemplate
    default:
      return DefaultPageTemplate
  }
}

class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {}

    await fetchOurData(ctx)

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps, store: ctx.reduxStore }
  }

  componentWillMount() {
    if (!this.props.store.selectIsDebug()) {
      this.props.store.doEnableDebug()
    }
  }

  componentDidMount() {}

  render() {
    const { Component, pageProps } = this.props

    const template =
      pageProps && pageProps.meta ? pageProps.meta.template : null

    const title =
      pageProps && pageProps.meta && pageProps.meta.title !== 'Blockstack'
        ? `${pageProps.meta.title} — Blockstack`
        : 'Blockstack'

    const withPageTemplate = renderTemplate(template)

    const PageComponent = withPageTemplate(Component, pageProps.meta, pageProps)
    return (
      <ReduxProvider store={this.props.store}>
        <Mdx>
          <Container>
            <Global />
            <Head>
              <script src="https://cdn.polyfill.io/v2/polyfill.min.js" />
              <style dangerouslySetInnerHTML={{ __html: styles }} />
              <title>{title}</title>
              <meta name="theme-color" content="#3700ff" />
              <meta charSet="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
              />
            </Head>

            <div className="landing-page">
              <Header />
              <PageComponent {...pageProps} />
              <Footer />
              <script
                type="text/javascript"
                src="https://my.hellobar.com/5782236799c23fe13e1cd8418582245ed81294f4.js"
                async="async"
              />
            </div>
          </Container>
        </Mdx>
      </ReduxProvider>
    )
  }
}

export default withReduxStore(MyApp)
