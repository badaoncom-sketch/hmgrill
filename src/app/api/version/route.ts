// 배포 버전 식별자. 클라이언트가 주기적으로 확인해 새 배포가 나가면 자동으로 새로고침한다.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    version:
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.VERCEL_DEPLOYMENT_ID ??
      "dev",
  });
}
