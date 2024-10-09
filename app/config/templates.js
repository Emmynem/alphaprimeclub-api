export const user_cancel_payment = (data) => {
	const email_subject = `Payment cancelled for Alpha Prime Club registration`;
	const email_text = `Your payment for Alpha Prime Club registration has been cancelled <br/><br/>`;
	const email_html = `Your payment for Alpha Prime Club registration has been cancelled <br/><br/>`;

	return { email_html, email_subject, email_text };
};

export const user_complete_payment = (data) => {
	const email_subject = `Payment complete for Alpha Prime Club registration`;
	const email_text = `Your payment for Alpha Prime Club registration with reference - ${data.reference} has been completed <br/><br/> Paid: ${data.amount}`;
	const email_html = `Your payment for Alpha Prime Club registration with reference - ${data.reference} has been completed <br/><br/> Paid: ${data.amount}`;

	return { email_html, email_subject, email_text };
};