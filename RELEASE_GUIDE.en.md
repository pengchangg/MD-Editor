# Release Guide

This project uses GitHub Actions to automatically build and release new versions. When you create a new tag, GitHub Actions will automatically run the build script and publish the build artifacts to GitHub Releases.

## Steps to Release a New Version

1. Ensure your code has been committed and pushed to the GitHub repository

   ```bash
   git add .
   git commit -m "Prepare for new release"
   git push origin main
   ```

2. Create a new tag and push it to GitHub

   ```bash
   # Create a new tag, e.g., v1.0.0
   git tag v1.0.0
   
   # Push the tag to GitHub
   git push origin v1.0.0
   ```

3. Wait for GitHub Actions to complete the build and release

   - You can check the build progress in the "Actions" tab of your GitHub repository
   - Once the build is complete, the new release will be automatically published on the "Releases" page of your GitHub repository

4. Edit the Release Notes

   - Find the newly published version on the "Releases" page of your GitHub repository
   - Click the "Edit" button to edit the release notes
   - Add the content of this version update in the "Update Content" section
   - Click "Update release" to save the changes

## Version Naming Convention

It is recommended to use Semantic Versioning ([Semantic Versioning](https://semver.org/)):

- Major version: when you make incompatible API changes
- Minor version: when you add functionality in a backwards compatible manner
- Patch version: when you make backwards compatible bug fixes

For example: v1.0.0, v1.1.0, v1.1.1

## Notes

- Each time a new tag is created, the build and release process will be triggered
- Make sure the code has been thoroughly tested before creating a tag
- Release notes should clearly describe the updates in this version to help users understand the changes 