import { prisma } from "./db";

export async function checkLimit(userId: string): Promise<boolean> {
  // ��ȡ��������ڣ�UTC ʱ�䣩������ʱ������Ϊ��ҹ����ȷ�����ڱȽϵ�׼ȷ��
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // �ӻ���������ȡÿ���������������û��������Ĭ��Ϊ 20
  const limitAmount = parseInt(process.env.DEFAULT_DAILY_LIMIT || '20');

  // ���Բ��ҽ�����û����Ƽ�¼
  const userLimit = await prisma.userLimit.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  // ����ҵ��˽���ļ�¼�����Ҽ����Ѵﵽ�򳬹�����
  if (userLimit && userLimit.count >= userLimit.limit) {
    return false; // �ѳ�������
  }

  // �����¼�����ڣ����ߴ��ڵ�δ���ޣ���ʹ�� upsert ����������¼�¼
  // upsert ��һ��ԭ�Ӳ������ܰ�ȫ�ش���������
  await prisma.userLimit.upsert({
    where: { userId_date: { userId, date: today } },
    // �����¼���ڣ��� count �� 1
    update: { count: { increment: 1 } },
    // �����¼�����ڣ��򴴽��¼�¼
    create: {
      userId,
      date: today,
      count: 1, // ���ǽ���ĵ�һ����Ϣ�����Լ����� 1 ��ʼ
      limit: limitAmount,
    },
  });

  return true; // δ��������
}