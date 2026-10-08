import { GameData } from '../types/game';

export const GAME_DATA: GameData = {
  title: "NÔNG TRẠI BÀN TAY",
  grade: "Lớp 7",
  subject: "Môn Công Nghệ",
  topic: "Gieo trồng và chăm sóc cây trồng",
  description: "Dùng bàn tay trước webcam để nhặt và thả các thẻ kỹ thuật trồng trọt vào đúng vị trí!",
  rounds: [
    {
      id: 1,
      title: "VÒNG 1: GIEO BẰNG HẠT & TRỒNG BẰNG CÂY CON",
      topic: "Phương pháp gieo trồng",
      instruction: "Dùng ngón trỏ và ngón cái chụm lại để nhặt thẻ đặc điểm/kỹ thuật và thả vào đúng phương pháp gieo trồng tương ứng!",
      description: "Phân biệt quy trình và yêu cầu giữa phương pháp gieo bằng hạt và trồng bằng cây con.",
      cards: [
        {
          id: "c1_1",
          title: "Xử lý ngâm ủ hạt giống",
          subtitle: "Ngâm nước ấm để kích thích mầm",
          icon: "🌱",
          tag: "Gieo hạt",
          targetId: "t1_1",
          score: 1,
          explanation: "Trước khi gieo, hạt thường được ngâm ủ nước ấm 2 sôi 3 lạnh để kích thích nảy mầm đồng đều và diệt mầm bệnh."
        },
        {
          id: "c1_2",
          title: "Đặt bầu cây thẳng đứng",
          subtitle: "Nén chặt đất quanh gốc cây con",
          icon: "🪴",
          tag: "Cây con",
          targetId: "t1_2",
          score: 1,
          explanation: "Khi trồng cây con, cần đặt cây thẳng đứng giữa hố, ấn chặt đất quanh gốc để cây không bị nghiêng đổ khi tưới nước."
        },
        {
          id: "c1_3",
          title: "Gieo sâu 1 - 2 cm & phủ đất",
          subtitle: "Tránh chim chuột ăn và nắng gắt",
          icon: "🌾",
          tag: "Gieo hạt",
          targetId: "t1_3",
          score: 1,
          explanation: "Gieo hạt cần phủ một lớp đất mịn mỏng khoảng 1-2 cm để giữ ẩm, tránh ánh nắng gay gắt và côn trùng cắn phá."
        },
        {
          id: "c1_4",
          title: "Che nắng & tưới ẩm nhẹ",
          subtitle: "Giúp cây non nhanh bén rễ hồi xanh",
          icon: "☂️",
          tag: "Cây con",
          targetId: "t1_4",
          score: 1,
          explanation: "Cây con mới chuyển chỗ trồng còn yếu, cần che bớt nắng gắt 2-3 ngày đầu và tưới nhẹ để rễ non nhanh phục hồi."
        }
      ],
      targets: [
        {
          id: "t1_1",
          title: "Chuẩn bị hạt trước khi gieo",
          subtitle: "Kỹ thuật đánh thức mầm ngủ",
          icon: "🧪",
          hint: "Thao tác ngâm ủ hạt giống trong nước ấm",
          color: "border-cyan-400 bg-cyan-950/40"
        },
        {
          id: "t1_2",
          title: "Kỹ thuật định vị cây giống",
          subtitle: "Thao tác đặt bầu và cố định gốc",
          icon: "🌿",
          hint: "Đặt cây con ngay ngắn và nén đất quanh gốc",
          color: "border-emerald-400 bg-emerald-950/40"
        },
        {
          id: "t1_3",
          title: "Yêu cầu độ sâu khi tra hạt",
          subtitle: "Độ ẩm và bảo vệ mầm trong luống",
          icon: "🕳️",
          hint: "Độ sâu gieo vừa phải kèm phủ lớp đất mặt",
          color: "border-amber-400 bg-amber-950/40"
        },
        {
          id: "t1_4",
          title: "Bảo vệ cây non sau khi trồng",
          subtitle: "Giảm thoát hơi nước và sốc nhiệt",
          icon: "🌤️",
          hint: "Biện pháp che chắn và cấp ẩm ban đầu cho cây con",
          color: "border-teal-400 bg-teal-950/40"
        }
      ]
    },
    {
      id: 2,
      title: "VÒNG 2: BIỆN PHÁP TƯỚI NƯỚC & TIÊU NƯỚC",
      topic: "Cấp nước và chống ngập úng",
      instruction: "Chụm tay gắp các phương pháp tưới/tiêu nước thả vào đúng mục đích và điều kiện kỹ thuật phù hợp!",
      description: "Nắm vững kỹ thuật tưới rãnh, tưới phun mưa, tưới nhỏ giọt và tiêu nước khi ngập úng.",
      cards: [
        {
          id: "c2_1",
          title: "Tưới tràn / Tưới rãnh",
          subtitle: "Dẫn nước ngấm vào rãnh luống",
          icon: "🌊",
          tag: "Tưới rãnh",
          targetId: "t2_1",
          score: 1,
          explanation: "Tưới rãnh dẫn nước vào các rãnh luống ngập 1/2 đến 2/3 rãnh, giúp nước ngấm từ từ vào đất cho cây ngô, khoai."
        },
        {
          id: "c2_2",
          title: "Tưới phun mưa & nhỏ giọt",
          subtitle: "Tiết kiệm nước, không xói mòn đất",
          icon: "💦",
          tag: "Công nghệ cao",
          targetId: "t2_2",
          score: 1,
          explanation: "Tưới phun sương hoặc nhỏ giọt trực tiếp vào gốc giúp tiết kiệm nước tối đa, không làm đóng váng mặt đất và xói mòn rễ."
        },
        {
          id: "c2_3",
          title: "Đào rãnh, bơm tháo nước úng",
          subtitle: "Kịp thời chống thối rễ khi mưa bão",
          icon: "🚜",
          tag: "Tiêu nước",
          targetId: "t2_3",
          score: 1,
          explanation: "Tiêu nước là biện pháp tháo bỏ lượng nước thừa trong ruộng khi mưa lớn, tránh làm rễ ngạt thở thiếu oxy dẫn đến thối rễ."
        },
        {
          id: "c2_4",
          title: "Tưới vào sáng sớm hoặc chiều mát",
          subtitle: "Tránh tưới trưa nắng gắt gây sốc nhiệt",
          icon: "🌅",
          tag: "Thời điểm tưới",
          targetId: "t2_4",
          score: 1,
          explanation: "Tưới nước vào buổi sáng sớm hoặc chiều mát giúp cây không bị sốc nhiệt và nước không bị bốc hơi lãng phí."
        }
      ],
      targets: [
        {
          id: "t2_1",
          title: "Cấp nước theo luống cây",
          subtitle: "Dành cho cây trồng theo luống cao",
          icon: "🏞️",
          hint: "Dẫn nước vào rãnh giữa các luống cây",
          color: "border-sky-400 bg-sky-950/40"
        },
        {
          id: "t2_2",
          title: "Kỹ thuật tưới hiện đại",
          subtitle: "Độ ẩm phân bố đều, tiết kiệm nước",
          icon: "🌧️",
          hint: "Hạt nước mịn dạng sương hoặc nhỏ giọt vào gốc",
          color: "border-blue-400 bg-blue-950/40"
        },
        {
          id: "t2_3",
          title: "Biện pháp giải cứu ngập úng",
          subtitle: "Ngăn ngừa hiện tượng thối rễ cây",
          icon: "⚠️",
          hint: "Tháo nước thừa ra khỏi ruộng khi ngập úng",
          color: "border-red-400 bg-red-950/40"
        },
        {
          id: "t2_4",
          title: "Nguyên tắc thời gian tưới trong ngày",
          subtitle: "Hạn chế bốc hơi và bảo vệ lá",
          icon: "⏰",
          hint: "Khoảng thời gian mát mẻ lý tưởng để tưới cây",
          color: "border-amber-400 bg-amber-950/40"
        }
      ]
    },
    {
      id: 3,
      title: "VÒNG 3: LÀM CỎ, VUN XỚI, TỈA & DẶM CÂY",
      topic: "Chăm sóc và điều chỉnh mật độ",
      instruction: "Chụm tay chọn từng thao tác chăm sóc cây trồng và thả vào đúng mục đích sinh học tương ứng!",
      description: "Hiểu rõ vai trò của việc nhổ cỏ dại, xới xáo đất, tỉa bớt cây yếu và dặm thêm cây con.",
      cards: [
        {
          id: "c3_1",
          title: "Nhổ sạch cỏ dại quanh gốc",
          subtitle: "Loại bỏ sinh vật cạnh tranh",
          icon: "🌿",
          tag: "Làm cỏ",
          targetId: "t3_1",
          score: 1,
          explanation: "Làm cỏ giúp loại bỏ cỏ dại cạnh tranh ánh sáng, nước và chất dinh dưỡng của cây trồng, đồng thời diệt nơi trú ngụ sâu bọ."
        },
        {
          id: "c3_2",
          title: "Xới đất tơi & vun đất vào gốc",
          subtitle: "Giúp rễ hô hấp và cây đứng vững",
          icon: "⛏️",
          tag: "Vun xới",
          targetId: "t3_2",
          score: 1,
          explanation: "Vun xới làm cho đất tơi xốp, thoáng khí để rễ dễ hấp thu oxy, đồng thời vun đất giữ cho gốc cây đứng vững chống đổ ngã."
        },
        {
          id: "c3_3",
          title: "Tỉa bỏ cây yếu, sâu bệnh, quá dày",
          subtitle: "Giữ lại cây khỏe, đúng khoảng cách",
          icon: "✂️",
          tag: "Tỉa cây",
          targetId: "t3_3",
          score: 1,
          explanation: "Tỉa bớt những cây mọc quá dày, còi cọc, dị dạng hoặc sâu bệnh để các cây còn lại đủ không gian và dinh dưỡng phát triển tốt."
        },
        {
          id: "c3_4",
          title: "Trồng bổ sung vào hốc hạt không mọc",
          subtitle: "Đảm bảo đúng mật độ cây trên ruộng",
          icon: "🌱",
          tag: "Dặm cây",
          targetId: "t3_4",
          score: 1,
          explanation: "Dặm cây là việc trồng bổ sung cây con vào những chỗ hạt không mọc hoặc cây bị chết để đảm bảo đúng mật độ và năng suất mùa vụ."
        }
      ],
      targets: [
        {
          id: "t3_1",
          title: "Triệt tiêu đối thủ hút dinh dưỡng",
          subtitle: "Bảo vệ ánh sáng và thức ăn cho cây",
          icon: "🚫",
          hint: "Diệt cỏ dại cạnh tranh thức ăn với cây trồng",
          color: "border-lime-400 bg-lime-950/40"
        },
        {
          id: "t3_2",
          title: "Tăng độ thoáng khí & chống đổ gốc",
          subtitle: "Bộ rễ phát triển sâu và chắc khỏe",
          icon: "🪴",
          hint: "Đất tơi xốp, oxy dồi dào, gốc cây đứng vững",
          color: "border-yellow-400 bg-yellow-950/40"
        },
        {
          id: "t3_3",
          title: "Tối ưu hóa mật độ dinh dưỡng",
          subtitle: "Loại bỏ cây còi cọc và sâu bệnh",
          icon: "🎯",
          hint: "Loại bớt cây yếu để tập trung nuôi cây khỏe",
          color: "border-rose-400 bg-rose-950/40"
        },
        {
          id: "t3_4",
          title: "Bù đắp khoảng trống trên ruộng",
          subtitle: "Đảm bảo đồng đều năng suất thu hoạch",
          icon: "📐",
          hint: "Trồng bổ sung vào những vị trí bị khuyết thiếu",
          color: "border-emerald-400 bg-emerald-950/40"
        }
      ]
    }
  ]
};
