const mongoose = require('mongoose');
const ChatNode = require('./models/ChatNode');

async function seedDB() {
  await mongoose.connect('mongodb+srv://YaelSh:SmCb5dzRQuyZTKmP@cluster0.qraxdxe.mongodb.net/Clocks');

  await ChatNode.deleteMany({});

  // תשובות סופיות
  const answerOrderStatus = await new ChatNode({ answer: "ההזמנה שלך בטיפול ותשלח בימים הקרובים." }).save();
  const answerCancelOrder = await new ChatNode({ answer: "כדי לבטל הזמנה, נא לפנות לשירות הלקוחות." }).save();
  const answerMensWatches = await new ChatNode({ answer: "אנו מציעים מגוון שעוני גברים של מותגים כמו קסיו, סייקו ועוד." }).save();
  const answerWomensWatches = await new ChatNode({ answer: "יש לנו מבחר שעוני נשים אלגנטיים ויוקרתיים." }).save();
  const answerStoreHours = await new ChatNode({ answer: "אנחנו פתוחים א'-ה' בין השעות 9:00–18:00." }).save();

  // תתי-צמתים
  const purchaseQuestionsNode = await new ChatNode({
    text: "מה ברצונך לדעת לגבי הקנייה?",
    options: [
      { text: "מה מצב ההזמנה שלי?", nextChatNodeId: answerOrderStatus._id },
      { text: "איך מבטלים הזמנה?", nextChatNodeId: answerCancelOrder._id },
    ]
  }).save();

  const productQuestionsNode = await new ChatNode({
    text: "איזה סוג שעונים מעניין אותך?",
    options: [
      { text: "שעוני גברים", nextChatNodeId: answerMensWatches._id },
      { text: "שעוני נשים", nextChatNodeId: answerWomensWatches._id },
    ]
  }).save();

  // צומת התחלתי
  const rootNode = await new ChatNode({
    text: "שלום וברוך הבא! כיצד נוכל לעזור לך?",
    isInitial: true,
    options: [
      { text: "ברצוני לשאול על הקנייה שלי", nextChatNodeId: purchaseQuestionsNode._id },
      { text: "רוצה מידע על סוגי השעונים", nextChatNodeId: productQuestionsNode._id },
      { text: "מהן שעות הפעילות?", nextChatNodeId: answerStoreHours._id },
      { text: "יש לי שאלה אחרת", nextChatNodeId: null }, // מאפשר טקסט חופשי
    ]
  }).save();

  console.log("נתוני עץ הצ'אט הוזנו בהצלחה.");
  mongoose.connection.close();
}

seedDB().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
