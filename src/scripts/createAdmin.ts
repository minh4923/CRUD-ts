import bcrypt from 'bcryptjs';
import User from '../models/User';

async function createAdmin(): Promise<void> {
    const name: string = 'admin';
    const email: string = 'minh0367913297@gmail.com';
    const password: string = 'admin2003';
    const role: string = 'admin';
    const hashedPassword: string = await bcrypt.hash(password, 10);

    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
        const admin = new User({ name, email, password: hashedPassword, role });
        await admin.save();
        console.log('Admin created');
    } else {
        console.log('Admin adready exists');
    }
}
export default createAdmin;
