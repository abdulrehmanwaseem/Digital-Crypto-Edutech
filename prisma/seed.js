var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var _this = this;
var PrismaClient = require("@prisma/client").PrismaClient;
var prisma = new PrismaClient();
var courses = [
  {
    id: "basic-1", // using courseId as the primary key
    title: "Basic",
    description: "Basic course description",
    imageUrl: "https://example.com/basic.jpg", // replace with an actual URL if needed
    price: 30,
    duration: "1 month",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
    ],
    stipend: null, // no stipend
    referralBonus: {
      amount: 5,
      type: "fixed",
      tiers: [
        { threshold: 3, bonus: 7 },
        { threshold: 5, bonus: 10 },
        { threshold: 10, bonus: 15 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 25 } },
        { referrals: 10, reward: { type: "planUpgrade", value: "Standard" } },
      ],
    },
  },
  {
    id: "standard-1",
    title: "Standard",
    description: "Standard course description",
    imageUrl: "https://example.com/standard.jpg",
    price: 50,
    duration: "2 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
      "Fundamental Analysis Training",
    ],
    stipend: null,
    referralBonus: {
      amount: 10,
      type: "percentage",
      tiers: [
        { threshold: 3, bonus: 12 },
        { threshold: 5, bonus: 15 },
        { threshold: 10, bonus: 20 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 50 } },
        { referrals: 10, reward: { type: "planUpgrade", value: "Premium" } },
      ],
    },
  },
  {
    id: "premium-1",
    title: "Premium",
    description: "Premium course description",
    imageUrl: "https://example.com/premium.jpg",
    price: 100,
    duration: "4 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
      "Fundamental Analysis Training",
      "Priority Support",
      "Advanced Market Analysis",
    ],
    stipend: { amount: 6, months: 3 },
    referralBonus: {
      amount: 15,
      type: "percentage",
      tiers: [
        { threshold: 3, bonus: 18 },
        { threshold: 5, bonus: 20 },
        { threshold: 10, bonus: 25 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 100 } },
        {
          referrals: 10,
          reward: {
            type: "courseAccess",
            value: "Advanced Trading Masterclass",
          },
        },
      ],
    },
  },
  {
    id: "professional-1",
    title: "Professional",
    description: "Professional course description",
    imageUrl: "https://example.com/professional.jpg",
    price: 200,
    duration: "6 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
      "Technical Analysis Resources",
      "Fundamental Analysis Training",
      "Priority Support",
      "Advanced Market Analysis",
      "One-on-One Mentoring",
      "Custom Trading Strategies",
    ],
    stipend: { amount: 12, months: 5 },
    referralBonus: {
      amount: 20,
      type: "percentage",
      tiers: [
        { threshold: 3, bonus: 25 },
        { threshold: 5, bonus: 30 },
        { threshold: 10, bonus: 35 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 200 } },
        {
          referrals: 10,
          reward: {
            type: "courseAccess",
            value: "Professional Trading Bundle",
          },
        },
      ],
    },
  },
];
function main() {
  var _a, _b;
  return __awaiter(this, void 0, void 0, function () {
    var _i, courses_1, course;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          console.log("Updating courses...");
          (_i = 0), (courses_1 = courses);
          _c.label = 1;
        case 1:
          if (!(_i < courses_1.length)) return [3 /*break*/, 4];
          course = courses_1[_i];
          return [
            4 /*yield*/,
            prisma.course.upsert({
              where: {
                id: course.id,
              },
              update: {
                title: course.title,
                description: course.description,
                imageUrl: course.imageUrl,
                price: course.price,
                duration: course.duration,
                features: course.features,
                stipend:
                  (_a = course.stipend) !== null && _a !== void 0
                    ? _a
                    : undefined,
                referralBonus: course.referralBonus,
              },
              create: {
                id: course.id,
                title: course.title,
                description: course.description,
                imageUrl: course.imageUrl,
                price: course.price,
                duration: course.duration,
                features: course.features,
                stipend:
                  (_b = course.stipend) !== null && _b !== void 0
                    ? _b
                    : undefined,
                referralBonus: course.referralBonus,
              },
            }),
          ];
        case 2:
          _c.sent();
          console.log("Updated/Created course: ".concat(course.title));
          _c.label = 3;
        case 3:
          _i++;
          return [3 /*break*/, 1];
        case 4:
          console.log("Update complete.");
          return [2 /*return*/];
      }
    });
  });
}
main()
  .catch(function (error) {
    console.log("Error updating courses:", error);
    process.exit(1);
  })
  .finally(function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, prisma.$disconnect()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
