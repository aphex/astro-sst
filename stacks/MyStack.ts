import { resolve, dirname } from 'path'
import { StackContext, Api, Bucket } from '@serverless-stack/resources'
import { aws_s3_deployment, RemovalPolicy } from 'aws-cdk-lib'
import { findUp } from 'find-up'

export async function MyStack({ stack }: StackContext) {
  let bucketURL

  if (!process.env.IS_LOCAL) {
    const root = await findUp('sst.json')
    if (!root) throw Error('This must be run in an SST project')

    const path = resolve(dirname(root), 'web', 'dist', 'client')
    const modulesBucket = new Bucket(stack, 'astro-assets', {
      cdk: {
        bucket: {
          websiteIndexDocument: 'index.html',
          websiteErrorDocument: '404.html',
          publicReadAccess: true,
          autoDeleteObjects: true,
          removalPolicy: RemovalPolicy.DESTROY,
        },
      },
    })

    const deployedModulesBucket = new aws_s3_deployment.BucketDeployment(stack, 'AstroAssetsDeployment', {
      sources: [aws_s3_deployment.Source.asset(path)],
      destinationBucket: modulesBucket.cdk.bucket,
    })

    // Amazon has different bucket URL formats
    // there is likely a better way to deal with this?
    // https://github.com/aws/aws-cdk/issues/13291
    bucketURL = deployedModulesBucket.deployedBucket.bucketWebsiteUrl.replace('.s3-website-', '.s3-website.')
  }

  const api = new Api(stack, 'api', {
    routes: {
      'GET /': 'functions/lambda.handler',
      'GET /favicon.ico': !bucketURL
        ? 'functions/proxy.handler'
        : {
            type: 'url',
            url: `${bucketURL}/favicon.ico`,
          },
      'GET /assets/{proxy+}': !bucketURL
        ? 'functions/proxy.handler'
        : {
            type: 'url',
            url: `${bucketURL}/assets/{proxy}`,
          },
    },
  })

  stack.addOutputs({
    ApiEndpoint: api.url,
    S3BucketURL: bucketURL || '',
  })
}
