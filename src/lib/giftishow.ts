/**
 * 기프티쇼 비즈 API 연동 서비스
 *
 * API 규격서 v1.04 기반
 * Base URL: https://bizapi.giftishow.com/bizApi
 *
 * 주요 API:
 * - 상품 리스트 (0101)
 * - 상품 상세 (0111)
 * - 브랜드 정보 (0102)
 * - 쿠폰 발송 (0204)
 * - 쿠폰 상세 (0201)
 * - 쿠폰 취소 (0202)
 * - 쿠폰 재전송 (0203)
 * - 비즈머니 잔액 (0301)
 * - 발송실패 취소 (0205)
 */

const GIFTISHOW_BASE_URL = "https://bizapi.giftishow.com/bizApi";

// API Codes
const API_CODES = {
  GOODS_LIST: "0101",
  GOODS_DETAIL: "0111",
  BRAND_LIST: "0102",
  BRAND_DETAIL: "0112",
  COUPON_DETAIL: "0201",
  COUPON_CANCEL: "0202",
  COUPON_RESEND: "0203",
  COUPON_SEND: "0204",
  SEND_FAIL_CANCEL: "0205",
  BIZ_MONEY: "0301",
} as const;

// Response Types
export interface GiftishowApiResponse<T> {
  code: string;
  message: string | null;
  result?: T;
}

export interface GoodsItem {
  goodsCode: string;
  goodsNo: number;
  goodsName: string;
  brandCode: string;
  brandName: string;
  content: string;
  contentAddDesc: string;
  discountRate: number;
  goodsTypeNm: string;
  goodsTypeDtlNm: string;
  goodsImgS: string;
  goodsImgB: string;
  goodsDescImgWeb?: string;
  brandIconImg: string;
  mmsGoodsImg: string;
  discountPrice: number;
  realPrice: number;
  salePrice: number;
  srchKeyword: string;
  validPrdTypeCd: string;
  limitDay: number;
  validPrdDay: string;
  endDate: string;
  goodsComId: string;
  goodsComName: string;
  affiliateId: string;
  affiliate: string;
  goodsStateCd: string;
  mmsReserveFlag: string;
  mmsBarcdCreateYn: string;
  category1Seq: number;
}

export interface GoodsListResult {
  listNum: number;
  goodsList: GoodsItem[];
}

export interface GoodsDetailResult {
  goodsDetail: GoodsItem & {
    goldPrice?: number;
    vipPrice?: number;
    platinumPrice?: number;
    goldDiscountRate?: number;
    vipDiscountRate?: number;
    platinumDiscountRate?: number;
    categoryName1?: string;
  };
}

export interface BrandItem {
  brandSeq: number;
  brandCode: string;
  brandName: string;
  brandBannerImg: string;
  brandIconImg: string;
  mmsThumImg: string;
  content: string;
  category1Name: string;
  category1Seq: number;
  category2Name: string;
  category2Seq: number;
  sort: number;
}

export interface BrandListResult {
  listNum: number;
  brandList: BrandItem[];
}

export interface CouponInfo {
  goodsCd: string;
  goodsNm: string;
  brandNm: string;
  pinStatusCd: string;
  pinStatusNm: string;
  sellPriceAmt: string;
  cnsmPriceAmt: string;
  remainAmt?: string;
  senderTelNo: string;
  recverTelNo: string;
  sendBasicCd: string;
  sendRstCd: string | null;
  sendRstMsg: string | null;
  sendStatusCd: string;
  validPrdEndDt: string;
  correcDtm: string;
  mmsBrandThumImg: string;
}

export interface CouponDetailResult {
  couponInfoList: CouponInfo[];
  resCode: string;
  resMsg: string;
}

export interface SendCouponResult {
  code: string;
  message: string | null;
  result: {
    orderNo: string;
    pinNo?: string;
    couponImgUrl?: string;
  };
}

export interface BizMoneyResult {
  balance: string;
}

// PIN Status Codes
export const PIN_STATUS = {
  "01": "발행",
  "02": "교환(사용완료)",
  "03": "반품",
  "04": "관리폐기",
  "05": "환불",
  "06": "재발행",
  "07": "구매취소(폐기)",
  "08": "기간만료",
  "09": "바우처(비활성)",
  "10": "잔액환불",
  "11": "잔액기간만료",
  "12": "기간만료취소",
  "13": "환전",
  "14": "환급",
  "15": "잔액환급",
  "16": "잔액기간만료취소",
  "21": "등록",
  "22": "등록취소",
  "23": "선점",
  "24": "임시발급상태",
} as const;

/**
 * 기프티쇼 비즈 API 클라이언트
 */
export class GiftishowClient {
  private authCode: string;
  private authToken: string;
  private userId: string;
  private devMode: boolean;

  constructor() {
    const authCode = process.env.GIFTISHOW_AUTH_CODE;
    const authToken = process.env.GIFTISHOW_AUTH_TOKEN;
    const userId = process.env.GIFTISHOW_USER_ID;
    const devMode = process.env.GIFTISHOW_DEV_MODE === "true";

    if (!authCode || !authToken || !userId) {
      throw new Error(
        "GIFTISHOW_AUTH_CODE, GIFTISHOW_AUTH_TOKEN, GIFTISHOW_USER_ID environment variables are required"
      );
    }

    this.authCode = authCode;
    this.authToken = authToken;
    this.userId = userId;
    this.devMode = devMode;
  }

  /**
   * API 요청 공통 메서드
   */
  private async request<T>(
    endpoint: string,
    apiCode: string,
    additionalParams: Record<string, string> = {}
  ): Promise<GiftishowApiResponse<T>> {
    const url = `${GIFTISHOW_BASE_URL}${endpoint}`;

    const params = new URLSearchParams({
      api_code: apiCode,
      custom_auth_code: this.authCode,
      custom_auth_token: this.authToken,
      dev_yn: this.devMode ? "Y" : "N",
      ...additionalParams,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`GiftShow API Error [${apiCode}]:`, error);
      throw error;
    }
  }

  /**
   * 상품 리스트 조회
   * @param start 시작 페이지 (기본값: 1)
   * @param size 페이지당 개수 (기본값: 20)
   */
  async getGoodsList(
    start: number = 1,
    size: number = 20
  ): Promise<GiftishowApiResponse<GoodsListResult>> {
    return this.request<GoodsListResult>("/goods", API_CODES.GOODS_LIST, {
      start: String(start),
      size: String(size),
    });
  }

  /**
   * 상품 상세 정보 조회
   * @param goodsCode 상품 코드
   */
  async getGoodsDetail(goodsCode: string): Promise<GiftishowApiResponse<GoodsDetailResult>> {
    return this.request<GoodsDetailResult>(`/goods/${goodsCode}`, API_CODES.GOODS_DETAIL, {});
  }

  /**
   * 브랜드 리스트 조회
   */
  async getBrandList(): Promise<GiftishowApiResponse<BrandListResult>> {
    return this.request<BrandListResult>("/brands", API_CODES.BRAND_LIST, {});
  }

  /**
   * 브랜드 상세 정보 조회
   * @param brandCode 브랜드 코드
   */
  async getBrandDetail(
    brandCode: string
  ): Promise<GiftishowApiResponse<{ brandDetail: BrandItem }>> {
    return this.request<{ brandDetail: BrandItem }>(
      `/brands/${brandCode}`,
      API_CODES.BRAND_DETAIL,
      {}
    );
  }

  /**
   * 쿠폰 상세 정보 조회
   * @param trId 거래 아이디
   */
  async getCouponDetail(trId: string): Promise<GiftishowApiResponse<CouponDetailResult[]>> {
    return this.request<CouponDetailResult[]>("/coupons", API_CODES.COUPON_DETAIL, {
      tr_id: trId,
    });
  }

  /**
   * 쿠폰 발송 요청
   *
   * @param params 발송 파라미터
   * - goodsCode: 상품 코드
   * - trId: 거래 아이디 (고유값, 25자 이하)
   * - phoneNo: 수신자 휴대폰 번호 ('-' 제외)
   * - mmsTitle: MMS 제목 (10자 이내)
   * - mmsMsg: MMS 메시지
   * - callbackNo: 발신 번호 ('-' 제외)
   * - gubun: 발송 방식 (Y: 핀번호, N: MMS, I: 바코드이미지)
   */
  async sendCoupon(params: {
    goodsCode: string;
    trId: string;
    phoneNo: string;
    mmsTitle: string;
    mmsMsg: string;
    callbackNo: string;
    gubun: "Y" | "N" | "I";
    orderNo?: string;
    templateId?: string;
    bannerId?: string;
  }): Promise<GiftishowApiResponse<SendCouponResult>> {
    // TR_ID 검증
    if (params.trId.length > 25) {
      throw new Error("TR_ID must be 25 characters or less");
    }

    // MMS 제목 검증
    if (params.mmsTitle.length > 10) {
      throw new Error("MMS title must be 10 characters or less");
    }

    const additionalParams: Record<string, string> = {
      goods_code: params.goodsCode,
      tr_id: params.trId,
      phone_no: params.phoneNo.replace(/-/g, ""),
      mms_title: params.mmsTitle,
      mms_msg: params.mmsMsg,
      callback_no: params.callbackNo.replace(/-/g, ""),
      user_id: this.userId,
      gubun: params.gubun,
    };

    if (params.orderNo) {
      additionalParams.order_no = params.orderNo;
    }
    if (params.templateId) {
      additionalParams.template_id = params.templateId;
    }
    if (params.bannerId) {
      additionalParams.banner_id = params.bannerId;
    }

    return this.request<SendCouponResult>("/send", API_CODES.COUPON_SEND, additionalParams);
  }

  /**
   * 쿠폰 취소
   * @param trId 거래 아이디
   */
  async cancelCoupon(trId: string): Promise<GiftishowApiResponse<null>> {
    return this.request<null>("/cancel", API_CODES.COUPON_CANCEL, {
      tr_id: trId,
      user_id: this.userId,
    });
  }

  /**
   * 쿠폰 재전송
   * @param trId 거래 아이디
   * @param smsFlag SMS 여부 (Y: SMS, N: MMS)
   */
  async resendCoupon(trId: string, smsFlag: "Y" | "N" = "N"): Promise<GiftishowApiResponse<null>> {
    return this.request<null>("/resend", API_CODES.COUPON_RESEND, {
      tr_id: trId,
      sms_flag: smsFlag,
      user_id: this.userId,
    });
  }

  /**
   * 발송 실패 취소
   * 비즈머니는 차감되고 핀은 발행되지 않는 경우 사용
   * @param trId 거래 아이디
   */
  async cancelSendFail(
    trId: string
  ): Promise<GiftishowApiResponse<{ code: string; message: string | null; result: null }>> {
    return this.request<{ code: string; message: string | null; result: null }>(
      "/sendFail/cancel",
      API_CODES.SEND_FAIL_CANCEL,
      {
        tr_id: trId,
        user_id: this.userId,
      }
    );
  }

  /**
   * 비즈머니 잔액 조회
   */
  async getBizMoney(): Promise<GiftishowApiResponse<BizMoneyResult>> {
    return this.request<BizMoneyResult>("/bizmoney", API_CODES.BIZ_MONEY, {
      user_id: this.userId,
    });
  }

  /**
   * TR_ID 생성 (권장 형식)
   * service_yyyyMMdd_random 형식
   */
  static generateTrId(prefix: string = "truehub"): string {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${dateStr}_${random}`.substring(0, 25);
  }
}

// Singleton instance
let giftishowClient: GiftishowClient | null = null;

export function getGiftishowClient(): GiftishowClient {
  if (!giftishowClient) {
    giftishowClient = new GiftishowClient();
  }
  return giftishowClient;
}

/**
 * Mock 모드 여부 확인
 */
export function isGiftishowMockMode(): boolean {
  return process.env.GIFTISHOW_MOCK_MODE === "true";
}

/**
 * Mock 상품 데이터 (상용 키 발급 전 UI 테스트용)
 */
export const MOCK_GOODS_LIST: GoodsItem[] = [
  {
    goodsCode: "G00001",
    goodsNo: 1,
    goodsName: "스타벅스 아메리카노 Tall",
    brandCode: "B001",
    brandName: "스타벅스",
    content: "스타벅스 아메리카노 Tall 사이즈",
    contentAddDesc: "",
    discountRate: 0,
    goodsTypeNm: "커피",
    goodsTypeDtlNm: "모바일쿠폰",
    goodsImgS: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 4500,
    realPrice: 4500,
    salePrice: 4500,
    srchKeyword: "스타벅스,커피,아메리카노",
    validPrdTypeCd: "D",
    limitDay: 93,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "스타벅스코리아",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 1,
  },
  {
    goodsCode: "G00002",
    goodsNo: 2,
    goodsName: "배스킨라빈스 파인트 아이스크림",
    brandCode: "B002",
    brandName: "배스킨라빈스",
    content: "배스킨라빈스 파인트 아이스크림 교환권",
    contentAddDesc: "",
    discountRate: 5,
    goodsTypeNm: "아이스크림",
    goodsTypeDtlNm: "모바일쿠폰",
    goodsImgS: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 8550,
    realPrice: 9000,
    salePrice: 9000,
    srchKeyword: "배스킨라빈스,아이스크림,파인트",
    validPrdTypeCd: "D",
    limitDay: 93,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "비알코리아",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 2,
  },
  {
    goodsCode: "G00003",
    goodsNo: 3,
    goodsName: "CU 모바일금액권 5,000원",
    brandCode: "B003",
    brandName: "CU",
    content: "CU 편의점 5,000원 금액권",
    contentAddDesc: "",
    discountRate: 2,
    goodsTypeNm: "편의점",
    goodsTypeDtlNm: "모바일금액권",
    goodsImgS: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 4900,
    realPrice: 5000,
    salePrice: 5000,
    srchKeyword: "CU,편의점,금액권",
    validPrdTypeCd: "D",
    limitDay: 365,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "BGF리테일",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 3,
  },
  {
    goodsCode: "G00004",
    goodsNo: 4,
    goodsName: "GS25 모바일금액권 10,000원",
    brandCode: "B004",
    brandName: "GS25",
    content: "GS25 편의점 10,000원 금액권",
    contentAddDesc: "",
    discountRate: 2,
    goodsTypeNm: "편의점",
    goodsTypeDtlNm: "모바일금액권",
    goodsImgS: "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 9800,
    realPrice: 10000,
    salePrice: 10000,
    srchKeyword: "GS25,편의점,금액권",
    validPrdTypeCd: "D",
    limitDay: 365,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "GS리테일",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 3,
  },
  {
    goodsCode: "G00005",
    goodsNo: 5,
    goodsName: "교촌치킨 허니오리지날 한마리",
    brandCode: "B005",
    brandName: "교촌치킨",
    content: "교촌치킨 허니오리지날 한마리 교환권",
    contentAddDesc: "",
    discountRate: 0,
    goodsTypeNm: "치킨",
    goodsTypeDtlNm: "모바일쿠폰",
    goodsImgS: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 20000,
    realPrice: 20000,
    salePrice: 20000,
    srchKeyword: "교촌치킨,치킨,허니오리지날",
    validPrdTypeCd: "D",
    limitDay: 93,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "교촌에프앤비",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 4,
  },
  {
    goodsCode: "G00006",
    goodsNo: 6,
    goodsName: "BBQ 황금올리브치킨 한마리",
    brandCode: "B006",
    brandName: "BBQ",
    content: "BBQ 황금올리브치킨 한마리 교환권",
    contentAddDesc: "",
    discountRate: 0,
    goodsTypeNm: "치킨",
    goodsTypeDtlNm: "모바일쿠폰",
    goodsImgS: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 22000,
    realPrice: 22000,
    salePrice: 22000,
    srchKeyword: "BBQ,치킨,황금올리브",
    validPrdTypeCd: "D",
    limitDay: 93,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "제너시스BBQ",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 4,
  },
  {
    goodsCode: "G00007",
    goodsNo: 7,
    goodsName: "메가MGC커피 아메리카노 (HOT/ICE)",
    brandCode: "B007",
    brandName: "메가커피",
    content: "메가MGC커피 아메리카노 HOT/ICE 선택",
    contentAddDesc: "",
    discountRate: 0,
    goodsTypeNm: "커피",
    goodsTypeDtlNm: "모바일쿠폰",
    goodsImgS: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 2000,
    realPrice: 2000,
    salePrice: 2000,
    srchKeyword: "메가커피,커피,아메리카노",
    validPrdTypeCd: "D",
    limitDay: 93,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "앤하우스",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 1,
  },
  {
    goodsCode: "G00008",
    goodsNo: 8,
    goodsName: "투썸플레이스 아메리카노 (R)",
    brandCode: "B008",
    brandName: "투썸플레이스",
    content: "투썸플레이스 아메리카노 Regular 사이즈",
    contentAddDesc: "",
    discountRate: 0,
    goodsTypeNm: "커피",
    goodsTypeDtlNm: "모바일쿠폰",
    goodsImgS: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop",
    goodsImgB: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
    brandIconImg: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=50&h=50&fit=crop",
    mmsGoodsImg: "",
    discountPrice: 4500,
    realPrice: 4500,
    salePrice: 4500,
    srchKeyword: "투썸플레이스,커피,아메리카노",
    validPrdTypeCd: "D",
    limitDay: 93,
    validPrdDay: "",
    endDate: "20261231",
    goodsComId: "",
    goodsComName: "",
    affiliateId: "",
    affiliate: "투썸플레이스",
    goodsStateCd: "SALE",
    mmsReserveFlag: "N",
    mmsBarcdCreateYn: "Y",
    category1Seq: 1,
  },
];

// Error codes mapping
export const GIFTISHOW_ERROR_CODES: Record<string, string> = {
  "0000": "정상처리",
  E0002: "API 코드가 존재하지 않습니다",
  E0007: "API 코드가 일치하지 않습니다",
  E0008: "유효한 인증 키가 아닙니다",
  E0009: "유효한 인증 토큰이 아닙니다",
  E0010: "비즈머니 잔액이 부족합니다",
  E0011: "인증키가 없습니다",
  E0012: "토큰키가 없습니다",
  E0013: "테스트 YN 값이 없습니다",
  E9999: "오류가 발생했습니다",
  ERR0000: "알수 없는 에러 입니다",
  ERR0005: "DBMS 에러 입니다",
  ERR0008: "SQL 에러 입니다",
  ERR0100: "현재 DEV 서비스를 이용할 수 없습니다",
  ERR0201: "필수 파라미터가 누락되었습니다",
  ERR0208: "상품 주문 관련 오류",
  ERR0209: "상품 주문 메시지 관련 오류",
  ERR0214: "TR ID가 없습니다",
  ERR0215: "TR ID가 중복되었습니다",
  ERR0300: "회원정보 조회 실패",
  ERR0301: "API 가입정보 없음",
  ERR0401: "요청한 제품이 없습니다",
  ERR0800: "비즈포인트 조회 오류",
  ERR0803: "비즈포인트 차감 오류",
  ERR0804: "비즈포인트 적립 오류",
  ERR0805: "쿠폰취소 실패",
  ERR0806: "제목이 20자를 초과했습니다",
  ERR0807: "TR_ID가 25byte를 초과했습니다",
  ERR0808: "이미 취소된 쿠폰",
  ERR0817: "수신전화번호 오류",
  ERR0999: "쿠폰발송오류",
  "COUPON.0001": "유효한 제목이 아닙니다",
  "COUPON.0002": "유효한 메시지가 아닙니다",
  "COUPON.0003": "거래 아이디(tr_id)의 허용길이를 초과하였습니다",
  "COUPON.0004": "유효한 거래 아이디(TR_ID)가 아닙니다",
  "COUPON.0005": "전화번호(phone_no)가 존재하지 않습니다",
  "COUPON.0006": "취소 불가능한 쿠폰입니다",
  "COUPON.0007": "교환된 상품으로 취소가 불가능합니다",
  "COUPON.0008": "이미 취소된 쿠폰입니다",
  "COUPON.0009": "쿠폰 재전송에 실패하였습니다",
  "COUPON.0010": "유효한 발신번호(callback_no)가 존재하지 않습니다",
  "COUPON.0011": "유효한 상품아이디(goods_code)가 존재하지 않습니다",
  "COUPON.0015": "중복된 거래아이디(tr_id)로 호출하였습니다",
};

export function getGiftishowErrorMessage(code: string): string {
  return GIFTISHOW_ERROR_CODES[code] || `알 수 없는 오류 (코드: ${code})`;
}
