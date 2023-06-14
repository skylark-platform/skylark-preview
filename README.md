[![React][react.js]][react-url]
[![Tailwind CSS][tailwind-css]][tailwind-url]
[![GraphQL][graphql]][graphql-url]

[![MIT License][license-shield]][license-url]
[![PRs Welcome][prs-welcome]][prs-welcome-url]

<!-- [![codecov][codecov-badge]][codecov-url] -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://www.skylarkplatform.com/">
    <img src="./docs/assets/icon-skylark-blue.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">Skylark Foresight</h3>

  <p align="center">
    Preview your users' experience on your Skylark powered Streaming app by modifying active Availability Rules directly in Google Chrome.
    <br />
    <a href="https://www.skylarkplatform.com/"><strong>Learn more »</strong></a>
    <br />
    <br />
    <!-- <a href="https://app.skylarkplatform.io">View App</a>
    · -->
    <a href="https://github.com/skylark-platform/skylark-ui/issues">Report Bug</a>
    ·
    <a href="https://github.com/skylark-platform/skylark-ui/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#running">Running</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

![Foresight Screen Shot][foresight-screenshot]

Introducing Foresight, the cutting-edge Google Chrome extension designed for Skylark-powered streaming platforms.

Enhance your content strategy by seamlessly modifying Availability Rules directly on the page.

With Foresight, you gain the ability to preview your users’ experience from anywhere in the world, at any time. Stay one step ahead by planning ahead and ensuring seamless content availability. Unleash the true potential of your streaming platform with Foresight, an indispensable tool for content creators and strategists.

### How it works

Once installed and configured with your Skylark credentials, Foresight intercepts requests to your Skylark and modifies its headers.

You are able to:

1. Time Travel in the request, meaning you can preview content that is availabile in the future.
2. Override Availability Dimensions, meaning you can preview how your app appears to any user type available in your Skylark.

---

<br />

## Getting Started

To set the code up locally for development, follow these steps:

### Prerequisites

- Yarn
  ```sh
   npm install -g yarn
  ```
- Vercel CLI
  ```sh
   npm install -g vercel@latest
  ```

### Running

Install the NPM dependencies:

```bash
yarn
```

Run the dev server powered by Vite:

```bash
yarn dev
```

Install the unpacked extension to your Google Chrome by following the instructions here: https://crxjs.dev/vite-plugin/getting-started/vanilla-js/dev-basics#install-the-extension

Using `yarn dev` means that Vite will be running with Hot Module Reload. Therefore you are free to make changes to the extension and it should reload automatically.

### Building

```bash
yarn build
```

### Publish to Chrome Web Store

1. Build the extension
2. Zip up the `dist` directory (`zip -r foresight.zip ./dist/`)
3. Follow the instructions on Google to submit it to the Web Store: https://developer.chrome.com/docs/webstore/publish/

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Skylark Support - support@skylarkplatform.com

Project Link: [https://github.com/skylark-platform/skylark-foresight](https://github.com/skylark-platform/skylark-foresight)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge
[prs-welcome-url]: http://makeapullrequest.com
[foresight-screenshot]: ./docs/assets/screenshot.png
[react.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[tailwind-css]: https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[tailwind-url]: https://tailwindcss.com/
[storybook]: https://img.shields.io/badge/-Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white
[storybook-url]: https://storybook.app.skylarkplatform.io
[vercel]: https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white
[vercel-url]: https://vercel.com/
[graphql]: https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white
[graphql-url]: https://graphql.org/

<!-- [codecov-badge]: https://img.shields.io/codecov/c/github/skylark-platform/skylark-ui?style=for-the-badge&token=G142TWXSJL
[codecov-url]: https://codecov.io/gh/skylark-platform/skylark-ui -->

[vercel-cli-url]: https://vercel.com/docs/cli
[nextjs-deploy-url]: https://nextjs.org/docs/deployment
[vercel-deploy-button]: https://vercel.com/docs/deploy-button
[saas-streamtv]: https://saas.apps.skylark-dev.skylarkplatform.io/
