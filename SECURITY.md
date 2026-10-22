# Security Policy

## Supported versions

Only the latest commit on `main` is supported. Sites built from the template don't receive updates automatically; pull in fixes from this repository yourself.

## Reporting a vulnerability

Please **don't** report security issues in public issues, discussions or pull requests.

Report them privately through GitHub: go to the [Security tab](https://github.com/satishjhanwer/react-portfolio-template/security) and choose **Report a vulnerability**. Include:

- what the issue is and where it is (file, component or build step)
- steps to reproduce, or a proof of concept
- the impact you expect, e.g. XSS through content, a CSP bypass, or a service-worker cache issue

You can expect an acknowledgement within a week. Once a fix is ready, it will be released on `main` and you'll be credited in the advisory unless you'd rather not be.

## Scope

The template is a fully static site with no backend. Relevant reports include issues in the code in this repository: the React app, the inline scripts in `index.html`, the Content-Security-Policy, the service worker and the build scripts.

Vulnerabilities in dependencies should go to the upstream project; Dependabot keeps this repository's dependencies up to date.
